import { ApiError } from './errors.js';
import { stripeIngressDisposition, type StripeIngressDisposition } from './stripe-webhook.js';
import {
  normalizeAlchemyObservation,
  type AlchemyTransferObservation,
  type NormalizedAlchemyEvidence,
} from './alchemy-observer.js';
import { validateAlchemyEnvelope } from './alchemy-observation.js';

export interface WebhookScope {
  provider: 'stripe' | 'circle' | 'alchemy';
  environment: 'test' | 'live';
  providerEventId: string;
}
export type FencedClaim =
  | { acquired: false; state: string }
  | { acquired: true; state: 'processing'; token: string; payload: Record<string, unknown> };
export type EvidenceDisposition = {
  action: 'evidence_recorded';
  reason: string;
  observations?: NormalizedAlchemyEvidence[];
};
export interface FencedWebhookStore {
  claim(scope: WebhookScope): Promise<FencedClaim>;
  finish(
    scope: WebhookScope,
    token: string,
    disposition: StripeIngressDisposition | EvidenceDisposition,
  ): Promise<void>;
  fail(scope: WebhookScope, token: string, code: string): Promise<void>;
  due(limit: number): Promise<WebhookScope[]>;
  renew?(scope: WebhookScope, token: string): Promise<void>;
}

/** A processing state alone is never a lease. All writes require the acquired token. */
export async function processStoredWebhook(
  store: FencedWebhookStore,
  scope: WebhookScope,
  alchemy?: {
    webhookId: string;
    resolve(
      payload: Record<string, unknown>,
      renew?: () => Promise<void>,
    ): Promise<AlchemyTransferObservation[]>;
  },
) {
  const claim = await store.claim(scope);
  if (typeof claim?.acquired !== 'boolean' || typeof claim.state !== 'string')
    throw new ApiError(503, 'webhook_inbox_unavailable', 'Invalid fenced claim contract');
  if (!claim.acquired)
    return claim.state === 'processed' || claim.state === 'dead_letter' ? 'duplicate' : 'deferred';
  if (!claim.token || claim.state !== 'processing' || !claim.payload)
    throw new ApiError(503, 'webhook_inbox_unavailable', 'Invalid fenced claim contract');
  try {
    let disposition: StripeIngressDisposition | EvidenceDisposition =
      scope.provider === 'stripe'
        ? stripeIngressDisposition({
            id: scope.providerEventId,
            type: String(claim.payload.type),
            environment: scope.environment,
            payload: claim.payload,
          })
        : { action: 'evidence_recorded' as const, reason: 'verified_provider_payload_only' };
    if (scope.provider === 'alchemy') {
      if (!alchemy || scope.environment !== 'live')
        throw new ApiError(
          503,
          'provider_not_configured',
          'Alchemy evidence consumer is unavailable',
        );
      validateAlchemyEnvelope(claim.payload, {
        webhookId: alchemy.webhookId,
        environment: 'production',
      });
      const observations = await alchemy.resolve(claim.payload, async () => {
        await store.renew?.(scope, claim.token);
      });
      if (observations.length > 100)
        throw new ApiError(422, 'invalid_webhook', 'Alchemy observation batch is too large');
      disposition = {
        action: 'evidence_recorded',
        reason: 'receipt_validated_noncanonical_observations',
        observations: observations.map((observation) =>
          normalizeAlchemyObservation(observation, 'LIVE'),
        ),
      };
    }
    // Subscription mutation and inbox completion share one fenced database transaction.
    await store.finish(scope, claim.token, disposition);
    return 'processed';
  } catch (error) {
    await store.fail(
      scope,
      claim.token,
      error instanceof ApiError ? error.code : 'webhook_processing_failed',
    );
    throw error;
  }
}

/** Explicit operator/worker entry point only: no scheduler, public route or live activation. */
export async function recoverWebhooks(
  store: FencedWebhookStore,
  limit = 25,
  alchemy?: Parameters<typeof processStoredWebhook>[2],
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error('Invalid recovery batch size');
  const result = { processed: 0, deferred: 0, failed: 0 };
  for (const scope of await store.due(limit)) {
    try {
      const outcome = await processStoredWebhook(store, scope, alchemy);
      if (outcome === 'processed') result.processed++;
      else result.deferred++;
    } catch {
      result.failed++;
    }
  }
  return result;
}

/** Requires the un-applied v2 SQL proposal. No fallback to unfenced legacy functions. */
export class SupabaseFencedWebhookStore implements FencedWebhookStore {
  constructor(
    private readonly url: string,
    private readonly key: string,
    private readonly request: typeof fetch = fetch,
  ) {}
  private async rpc(name: string, body: Record<string, unknown>) {
    const response = await this.request(`${this.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: this.key,
        authorization: `Bearer ${this.key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok)
      throw new ApiError(503, 'webhook_inbox_unavailable', 'Fenced webhook storage is unavailable');
    return response.json();
  }
  private args(scope: WebhookScope) {
    return {
      p_provider: scope.provider,
      p_environment: scope.environment,
      p_provider_event_id: scope.providerEventId,
    };
  }
  async claim(scope: WebhookScope): Promise<FencedClaim> {
    return this.rpc('claim_provider_webhook_v2', this.args(scope)) as Promise<FencedClaim>;
  }
  async finish(
    scope: WebhookScope,
    token: string,
    disposition: StripeIngressDisposition | EvidenceDisposition,
  ) {
    const value = await this.rpc('finish_provider_webhook_v2', {
      ...this.args(scope),
      p_token: token,
      p_disposition: disposition,
    });
    if (value?.state !== 'processed')
      throw new ApiError(409, 'webhook_replay_detected', 'Webhook lease ownership was lost');
  }
  async fail(scope: WebhookScope, token: string, code: string) {
    await this.rpc('fail_provider_webhook_v2', {
      ...this.args(scope),
      p_token: token,
      p_error_code: code,
    });
  }
  async renew(scope: WebhookScope, token: string) {
    const value = await this.rpc('renew_provider_webhook_v2', {
      ...this.args(scope),
      p_token: token,
    });
    if (value?.state !== 'processing')
      throw new ApiError(409, 'webhook_replay_detected', 'Webhook lease ownership was lost');
  }
  async due(limit: number): Promise<WebhookScope[]> {
    const values: unknown = await this.rpc('due_provider_webhooks_v2', { p_limit: limit });
    if (!Array.isArray(values) || values.length > limit)
      throw new ApiError(503, 'webhook_inbox_unavailable', 'Invalid webhook recovery contract');
    return values.map((value: Record<string, unknown>) => {
      if (
        !['stripe', 'alchemy', 'circle'].includes(String(value.provider)) ||
        !['test', 'live'].includes(String(value.environment)) ||
        typeof value.provider_event_id !== 'string'
      )
        throw new ApiError(503, 'webhook_inbox_unavailable', 'Invalid webhook recovery scope');
      return {
        provider: value.provider,
        environment: value.environment,
        providerEventId: value.provider_event_id,
      } as WebhookScope;
    });
  }
}
