import { createHash } from 'node:crypto';
import { ApiError } from './errors.js';
import type { Config } from './config.js';
import type { CapabilityState } from './funding-domain.js';
import { publicFundingDefinitions } from './asset-registry.js';
import { StripeTreasuryAdapter } from './stripe-treasury.js';
import { verifyStripeWebhook } from './stripe-webhook.js';
import { SupabaseFinancialOperations } from './financial-operations.js';
import {
  requestDigest,
  type FinancialRepository,
  type FundingIntentRecord,
  type TransferAliasRecord,
  type TransferExecutionRecord,
} from './financial-repository.js';

type FinancialContext = {
  method: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string | undefined>;
  body: unknown;
  rawBody: Buffer;
};
type RouteResult = { status?: number; data: unknown };

export type FinancialCapability = {
  code: string;
  asset: string;
  network: string;
  state: CapabilityState;
  reason?: string;
};

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
}
function idempotencyKey(context: FinancialContext): string {
  const value = context.headers['idempotency-key'];
  if (!value || value.length < 8 || value.length > 128)
    throw new ApiError(400, 'idempotency_key_required', 'A valid Idempotency-Key header is required');
  return value;
}
function atomic(value: unknown, optional = false): string | undefined {
  if (value === undefined || value === null || value === '') {
    if (optional) return undefined;
    throw new ApiError(422, 'validation_failed', 'A positive atomic amount is required');
  }
  const text = String(value);
  if (!/^\d+$/.test(text) || BigInt(text) <= 0n)
    throw new ApiError(422, 'validation_failed', 'A positive atomic amount is required');
  return text;
}

export function liveFundingCapabilities(config: Config): FinancialCapability[] {
  const stripe = new StripeTreasuryAdapter({
    secretKey: config.STRIPE_SECRET_KEY,
    webhookSecret: config.STRIPE_WEBHOOK_SECRET,
    financialAccountId: config.STRIPE_TREASURY_FINANCIAL_ACCOUNT_ID,
    environment: 'LIVE',
    eligibilityVerified: config.STRIPE_TREASURY_ELIGIBILITY_VERIFIED,
    liveExecutionEnabled: config.STRIPE_TREASURY_LIVE_EXECUTION_ENABLED,
  }).capability();
  const digitalState: CapabilityState = config.CIRCLE_LIVE_CAPABILITY_VERIFIED
    ? 'DISABLED'
    : 'NOT_CONFIGURED';
  const digitalReason = config.CIRCLE_LIVE_CAPABILITY_VERIFIED
    ? 'circle_live_execution_gate_closed'
    : 'circle_live_capability_not_verified';

  return publicFundingDefinitions().map((definition) => {
    if (definition.capabilityCode === 'USD_ACH') {
      return {
        code: definition.capabilityCode,
        asset: definition.asset,
        network: definition.network,
        state: stripe.usdAch,
        ...(stripe.reason ? { reason: stripe.reason } : {}),
      };
    }
    if (definition.capabilityCode === 'USDC_BASE') {
      return {
        code: definition.capabilityCode,
        asset: definition.asset,
        network: definition.network,
        state: digitalState,
        reason: digitalReason,
      };
    }
    return {
      code: definition.capabilityCode,
      asset: definition.asset,
      network: definition.network,
      state: 'NOT_CONFIGURED' as const,
      reason: 'circle_live_asset_network_not_verified',
    };
  });
}

function capabilityByCode(config: Config, code: string): FinancialCapability {
  const value = liveFundingCapabilities(config).find((item) => item.code === code);
  if (!value) throw new ApiError(422, 'unsupported_capability', 'Funding capability is unsupported');
  return value;
}
function enabled(capability: FinancialCapability) {
  if (capability.state !== 'ENABLED')
    throw new ApiError(503, 'provider_capability_unavailable', capability.reason ?? 'Funding capability is unavailable');
}
function fundingPublic(value: FundingIntentRecord) {
  return { id: value.id, asset: value.asset, network: value.network, rail: value.rail, amount_atomic: value.amountAtomic,
    state: value.state, environment: value.environment, created_at: value.createdAt, updated_at: value.updatedAt };
}
function aliasPublic(value: TransferAliasRecord) {
  return { id: value.id, alias: value.alias, destination_type: value.destinationType, verification_state: value.verificationState,
    activation_state: value.activationState, created_at: value.createdAt, updated_at: value.updatedAt };
}
function transferPublic(value: TransferExecutionRecord) {
  return { id: value.id, alias_id: value.aliasId, asset: value.asset, network: value.network, rail: value.rail,
    amount_atomic: value.amountAtomic, state: value.state, environment: value.environment, created_at: value.createdAt, updated_at: value.updatedAt };
}

export async function handleFinancialRoute(
  context: FinancialContext,
  deps: {
    config: Config;
    repository: FinancialRepository;
    ownerId: () => Promise<string>;
    capabilityResolver?: (code: string) => FinancialCapability;
    transferRequestEnabled?: boolean;
  },
): Promise<RouteResult | undefined> {
  const { method, path } = context;
  const capability = (code: string) => deps.capabilityResolver?.(code) ?? capabilityByCode(deps.config, code);

  if (method === 'POST' && path === '/v1/webhooks/stripe') {
    if (!deps.config.SUPABASE_URL || !deps.config.SUPABASE_SERVICE_ROLE_KEY)
      throw new ApiError(503, 'financial_storage_unavailable', 'Durable webhook storage is not configured');
    const verified = verifyStripeWebhook({
      rawBody: context.rawBody,
      signatureHeader: context.headers['stripe-signature'],
      endpointSecret: deps.config.STRIPE_WEBHOOK_SECRET,
      toleranceSeconds: deps.config.WEBHOOK_TOLERANCE_SECONDS,
    });
    const operations = new SupabaseFinancialOperations(
      deps.config.SUPABASE_URL,
      deps.config.SUPABASE_SERVICE_ROLE_KEY,
    );
    const insertion = await operations.recordWebhook({
      provider: 'stripe',
      environment: verified.environment,
      providerEventId: verified.id,
      payloadDigest: createHash('sha256').update(context.rawBody).digest('hex'),
      payload: verified.payload,
      signatureVerifiedAt: new Date().toISOString(),
    });
    return { status: insertion === 'duplicate' ? 200 : 202, data: { received: true, duplicate: insertion === 'duplicate' } };
  }

  if (method === 'GET' && path === '/v1/funding/capabilities') {
    await deps.ownerId();
    return { data: { environment: 'LIVE', custody_model: 'OMNIBUS', capabilities: liveFundingCapabilities(deps.config) } };
  }

  if (method === 'POST' && path === '/v1/funding/intents') {
    const ownerId = await deps.ownerId();
    assertObject(context.body);
    const code = String(context.body.capability ?? '');
    const selected = capability(code);
    enabled(selected);
    const amountAtomic = atomic(context.body.amount_atomic, code !== 'USD_ACH');
    const key = idempotencyKey(context);
    const canonicalInput = { capability: code, asset: selected.asset, network: selected.network, amount_atomic: amountAtomic ?? null };
    const result = await deps.repository.createFundingIntent({
      ownerId,
      asset: selected.asset,
      ...(selected.network !== 'ACH' ? { network: selected.network } : {}),
      rail: code,
      ...(amountAtomic ? { amountAtomic } : {}),
      environment: 'LIVE',
      idempotencyKey: key,
      requestDigest: requestDigest(canonicalInput),
    });
    return { status: result.replayed ? 200 : 201, data: { ...fundingPublic(result.value), replayed: result.replayed } };
  }

  const fundingMatch = path.match(/^\/v1\/funding\/intents\/([^/]+)$/);
  if (method === 'GET' && fundingMatch?.[1])
    return { data: fundingPublic(await deps.repository.getFundingIntent(await deps.ownerId(), fundingMatch[1])) };
  if (method === 'GET' && path === '/v1/funding/activity') {
    const data = await deps.repository.listFundingIntents(await deps.ownerId(), 100);
    return { data: { state: data.length ? 'VALUE' : 'EMPTY', data: data.map(fundingPublic) } };
  }

  if (method === 'GET' && path === '/v1/capital-account/balances') {
    const data = await deps.repository.getCanonicalBalances(await deps.ownerId());
    return { data: { state: data.length ? 'VALUE' : 'EMPTY', source: 'NEPTLIUM_CANONICAL_LEDGER', balances: data.map((item) => ({
      asset: item.asset, network: item.network, total_atomic: item.totalAtomic, available_atomic: item.availableAtomic,
      reserved_atomic: item.reservedAtomic, pending_atomic: item.pendingAtomic, restricted_atomic: item.restrictedAtomic,
    })) } };
  }

  if (method === 'GET' && path === '/v1/capital-account/deposit-instructions') {
    const ownerId = await deps.ownerId();
    const fundingIntentId = context.query.get('funding_intent_id');
    if (fundingIntentId) {
      const intent = await deps.repository.getFundingIntent(ownerId, fundingIntentId);
      const selected = capability(intent.rail);
      if (selected.state !== 'ENABLED')
        return { data: { funding_intent_id: intent.id, capability: selected.code, state: selected.state, reason: selected.reason ?? 'unavailable' } };
      const route = await deps.repository.getDepositRoute(ownerId, intent.id);
      if (!route || route.status !== 'active')
        return { data: { funding_intent_id: intent.id, capability: selected.code, state: 'PENDING', reason: 'governed_deposit_route_not_assigned' } };
      return { data: {
        funding_intent_id: intent.id,
        capability: selected.code,
        state: 'ENABLED',
        asset: route.asset,
        network: route.network,
        deposit_address: route.depositAddress,
        memo_or_tag: route.memoOrTag,
      } };
    }
    const selected = capability(context.query.get('capability') ?? '');
    if (selected.state !== 'ENABLED')
      return { data: { capability: selected.code, state: selected.state, reason: selected.reason ?? 'unavailable' } };
    return { data: { capability: selected.code, state: 'PENDING', reason: 'funding_intent_required_for_user_specific_route' } };
  }

  if (method === 'GET' && path === '/v1/treasury/aliases') {
    const data = await deps.repository.listAliases(await deps.ownerId());
    return { data: { state: data.length ? 'VALUE' : 'EMPTY', data: data.map(aliasPublic) } };
  }
  if (method === 'POST' && path === '/v1/treasury/aliases') {
    const ownerId = await deps.ownerId();
    assertObject(context.body);
    const aliasValue = String(context.body.alias ?? '').trim();
    const destinationType = String(context.body.destination_type ?? '').trim();
    const destinationReference = String(context.body.destination_reference ?? '').trim();
    if (!/^[A-Za-z0-9._-]{3,64}$/.test(aliasValue) || !destinationType || destinationReference.length < 3 || destinationReference.length > 512)
      throw new ApiError(422, 'validation_failed', 'Transfer alias or destination is invalid');
    const value = await deps.repository.createAlias({ ownerId, alias: aliasValue, destinationType, destinationReference });
    return { status: 201, data: aliasPublic(value) };
  }

  if (method === 'GET' && path === '/v1/treasury/transfer-capabilities') {
    await deps.ownerId();
    return { data: { environment: 'LIVE', custody_model: 'OMNIBUS', capabilities: liveFundingCapabilities(deps.config).map((item) => ({
      ...item, purpose: 'TRANSFER', state: 'DISABLED', reason: 'outbound_execution_not_activated',
    })) } };
  }

  if (method === 'POST' && path === '/v1/treasury/transfers') {
    const ownerId = await deps.ownerId();
    if (!deps.transferRequestEnabled)
      throw new ApiError(503, 'live_execution_disabled', 'Outbound transfer requests are not activated');
    assertObject(context.body);
    const code = String(context.body.capability ?? '');
    const selected = capability(code);
    enabled(selected);
    const aliasId = String(context.body.alias_id ?? '').trim();
    if (!aliasId) throw new ApiError(422, 'validation_failed', 'A verified transfer alias is required');
    const amountAtomic = atomic(context.body.amount_atomic)!;
    const key = idempotencyKey(context);
    const canonicalInput = { alias_id: aliasId, capability: code, amount_atomic: amountAtomic };
    const result = await deps.repository.createTransfer({
      ownerId, aliasId, asset: selected.asset,
      ...(selected.network !== 'ACH' ? { network: selected.network } : {}),
      rail: code, amountAtomic, environment: 'LIVE', idempotencyKey: key, requestDigest: requestDigest(canonicalInput),
    });
    return { status: result.replayed ? 200 : 202, data: { ...transferPublic(result.value), replayed: result.replayed } };
  }

  const transferMatch = path.match(/^\/v1\/treasury\/transfers\/([^/]+)$/);
  if (method === 'GET' && transferMatch?.[1])
    return { data: transferPublic(await deps.repository.getTransfer(await deps.ownerId(), transferMatch[1])) };
  if (method === 'GET' && path === '/v1/treasury/transfers') {
    const data = await deps.repository.listTransfers(await deps.ownerId(), 100);
    return { data: { state: data.length ? 'VALUE' : 'EMPTY', data: data.map(transferPublic) } };
  }
  return undefined;
}
