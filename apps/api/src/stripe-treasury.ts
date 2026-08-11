import { ApiError } from './errors.js';
import type { CapabilityState, ProviderEnvironment } from './funding-domain.js';

export interface StripeTreasuryCapability {
  environment: ProviderEnvironment;
  usdAch: CapabilityState;
  financialAccountId?: string;
  reason?: string;
}

export interface StripeTreasuryConfig {
  secretKey: string | undefined;
  webhookSecret: string | undefined;
  financialAccountId: string | undefined;
  environment: ProviderEnvironment;
  eligibilityVerified: boolean;
  liveExecutionEnabled: boolean;
}

export interface StripeInboundTransfer {
  id: string;
  status: 'processing' | 'succeeded' | 'failed' | 'canceled';
  amount: number;
  currency: 'usd';
  financialAccountId: string;
  transactionId: string | null;
  livemode: boolean;
  returned: boolean;
}

type Fetch = typeof fetch;

export class StripeTreasuryAdapter {
  constructor(
    private readonly config: StripeTreasuryConfig,
    private readonly request: Fetch = fetch,
  ) {}

  capability(): StripeTreasuryCapability {
    if (!this.config.secretKey || !this.config.webhookSecret || !this.config.financialAccountId)
      return { environment: this.config.environment, usdAch: 'NOT_CONFIGURED', reason: 'stripe_treasury_configuration_incomplete' };
    if (!this.config.eligibilityVerified)
      return { environment: this.config.environment, usdAch: 'INELIGIBLE', reason: 'stripe_treasury_eligibility_not_verified' };
    if (this.config.environment === 'LIVE' && !this.config.liveExecutionEnabled)
      return { environment: 'LIVE', usdAch: 'DISABLED', financialAccountId: this.config.financialAccountId, reason: 'live_execution_gate_closed' };
    return { environment: this.config.environment, usdAch: 'ENABLED', financialAccountId: this.config.financialAccountId };
  }

  async createInboundTransfer(input: {
    amount: number;
    currency: 'usd';
    paymentMethod: string;
    idempotencyKey: string;
    description?: string;
  }): Promise<StripeInboundTransfer> {
    const capability = this.capability();
    if (capability.usdAch !== 'ENABLED')
      throw new ApiError(503, 'provider_capability_unavailable', capability.reason ?? 'Stripe Treasury unavailable');
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
      throw new ApiError(422, 'validation_failed', 'Stripe Treasury amount must be a positive integer in cents');
    if (!/^pm_[A-Za-z0-9]+$/.test(input.paymentMethod))
      throw new ApiError(422, 'validation_failed', 'Stripe Treasury requires a valid origin PaymentMethod reference');
    if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 128)
      throw new ApiError(422, 'validation_failed', 'Stripe Treasury idempotency key is invalid');

    const body = new URLSearchParams({
      financial_account: this.config.financialAccountId!,
      amount: String(input.amount),
      currency: input.currency,
      origin_payment_method: input.paymentMethod,
    });
    if (input.description) body.set('description', input.description.slice(0, 350));

    let response: Response;
    try {
      response = await this.request('https://api.stripe.com/v1/treasury/inbound_transfers', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.config.secretKey!}`,
          'content-type': 'application/x-www-form-urlencoded',
          'idempotency-key': input.idempotencyKey,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ApiError(503, 'provider_unavailable', 'Stripe Treasury is unavailable');
    }

    const payload = await response.json().catch(() => undefined) as Record<string, unknown> | undefined;
    if (!response.ok) {
      const stripeCode = payload && typeof payload.error === 'object' && payload.error && 'code' in payload.error
        ? String((payload.error as { code?: unknown }).code ?? 'provider_error')
        : 'provider_error';
      throw new ApiError(502, 'provider_submission_failed', 'Stripe Treasury rejected the funding submission', { provider_code: stripeCode });
    }
    if (!payload || typeof payload.id !== 'string' || payload.object !== 'treasury.inbound_transfer')
      throw new ApiError(502, 'provider_response_invalid', 'Stripe Treasury returned an invalid InboundTransfer response');
    if (!['processing', 'succeeded', 'failed', 'canceled'].includes(String(payload.status)))
      throw new ApiError(502, 'provider_response_invalid', 'Stripe Treasury returned an unsupported InboundTransfer status');
    if (typeof payload.amount !== 'number' || payload.currency !== 'usd' || typeof payload.financial_account !== 'string' || typeof payload.livemode !== 'boolean')
      throw new ApiError(502, 'provider_response_invalid', 'Stripe Treasury returned incomplete InboundTransfer evidence');
    if (this.config.environment === 'LIVE' && payload.livemode !== true)
      throw new ApiError(502, 'provider_environment_mismatch', 'Stripe TEST object cannot enter LIVE funding state');
    if (this.config.environment === 'TEST' && payload.livemode !== false)
      throw new ApiError(502, 'provider_environment_mismatch', 'Stripe LIVE object cannot enter TEST funding state');

    return {
      id: payload.id,
      status: payload.status as StripeInboundTransfer['status'],
      amount: payload.amount,
      currency: 'usd',
      financialAccountId: payload.financial_account,
      transactionId: typeof payload.transaction === 'string' ? payload.transaction : null,
      livemode: payload.livemode,
      returned: payload.returned === true,
    };
  }
}
