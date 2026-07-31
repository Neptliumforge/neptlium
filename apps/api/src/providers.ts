import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

export type ProviderState = 'configured' | 'not_configured' | 'degraded' | 'disabled';
export interface AddressProvider {
  readonly name: string;
  readiness(): ProviderState;
  createDepositAddress(): Promise<never>;
}
export interface ProviderTransaction {
  providerReference: string;
  state: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
}
export interface WalletProvider extends AddressProvider {
  submitWithdrawal(input: {
    operationId: string;
    asset: string;
    network: string;
    amount: string;
    destination: string;
  }): Promise<ProviderTransaction>;
  getTransaction(providerReference: string): Promise<ProviderTransaction>;
}

export class DisabledProvider implements AddressProvider {
  constructor(public readonly name: string) {}
  readiness(): ProviderState {
    return 'not_configured';
  }
  async createDepositAddress(): Promise<never> {
    throw new ApiError(503, 'provider_not_configured', `${this.name} provider is not configured`);
  }
}
export class DisabledWalletProvider extends DisabledProvider implements WalletProvider {
  async submitWithdrawal(): Promise<never> {
    throw new ApiError(503, 'provider_not_configured', `${this.name} provider is not configured`);
  }
  async getTransaction(): Promise<never> {
    throw new ApiError(503, 'provider_not_configured', `${this.name} provider is not configured`);
  }
}

export interface WebhookVerificationInput {
  rawBody: Buffer;
  headers: Readonly<Record<string, string | undefined>>;
  now?: number;
}

export interface WebhookVerifier {
  verify(input: WebhookVerificationInput): void | Promise<void>;
}

/** Test/local verifier only. Production provider adapters must implement the provider's reviewed contract. */
export class TimestampedHmacTestVerifier implements WebhookVerifier {
  constructor(
    private readonly secret: string,
    private readonly toleranceSeconds = 300,
  ) {}
  verify({ rawBody, headers, now = Date.now() }: WebhookVerificationInput) {
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];
    if (!signature || !timestamp || !/^\d+$/.test(timestamp))
      throw new ApiError(401, 'invalid_webhook', 'Missing webhook verification headers');
    if (Math.abs(now - Number(timestamp) * 1000) > this.toleranceSeconds * 1000)
      throw new ApiError(401, 'invalid_webhook', 'Webhook timestamp is outside tolerance');
    const suppliedHex = signature.replace(/^sha256=/, '');
    const expected = createHmac('sha256', this.secret)
      .update(`${timestamp}.`)
      .update(rawBody)
      .digest();
    let supplied: Buffer;
    try {
      supplied = Buffer.from(suppliedHex, 'hex');
    } catch {
      throw new ApiError(401, 'invalid_webhook', 'Invalid webhook signature');
    }
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected))
      throw new ApiError(401, 'invalid_webhook', 'Invalid webhook signature');
  }
}

export type ReconciliationClassification =
  | 'missing_provider_record'
  | 'missing_internal_record'
  | 'duplicate_provider_event'
  | 'duplicate_internal_event'
  | 'confirmation_mismatch'
  | 'amount_mismatch'
  | 'asset_mismatch'
  | 'network_mismatch'
  | 'pending_timeout'
  | 'unknown_state';

export function classifyMismatch(
  provider: Record<string, unknown> | undefined,
  internal: Record<string, unknown> | undefined,
): ReconciliationClassification | undefined {
  if (!provider) return 'missing_provider_record';
  if (!internal) return 'missing_internal_record';
  for (const [field, result] of [
    ['amount', 'amount_mismatch'],
    ['asset', 'asset_mismatch'],
    ['network', 'network_mismatch'],
    ['confirmations', 'confirmation_mismatch'],
  ] as const) {
    if (provider[field] !== internal[field]) return result;
  }
  return undefined;
}
