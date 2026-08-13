import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors.js';

export type ProviderState = 'configured' | 'not_configured' | 'degraded' | 'disabled';
export type CapitalEnvironment = 'testnet' | 'production';
export type CapitalAsset = 'USDC';
export type CapitalNetwork = 'BASE-SEPOLIA' | 'BASE';

export interface ProviderWalletLink {
  provider: string; providerWalletId: string; providerWalletSetId?: string; accountType: 'EOA';
  blockchain: CapitalNetwork; address: string; environment: CapitalEnvironment; status: 'live' | 'pending' | 'disabled';
}
export interface ProviderBalance {
  asset: CapitalAsset; network: CapitalNetwork; available: string; observedAt: string;
  synchronizationState: 'provider_observed';
}
export interface ProviderTransaction {
  providerReference: string; providerState: string;
  ledgerState: 'proposed' | 'approved' | 'reserved' | 'submitted' | 'partially_filled' | 'settled' | 'failed' | 'reversed' | 'cancelled';
  observedAt: string;
}
export interface CapitalProvider {
  readonly identity: string; readonly environment: CapitalEnvironment;
  readiness(): ProviderState; supports(asset: string, network: string): boolean;
  provisionWallet(input: { refId: string; idempotencyKey: string; walletSetId?: string }): Promise<ProviderWalletLink>;
  lookupWallet(providerWalletId: string): Promise<ProviderWalletLink>;
  getDepositAddress(wallet: ProviderWalletLink): Promise<ProviderWalletLink>;
  getBalances(wallet: ProviderWalletLink): Promise<ProviderBalance[]>;
  createTransfer(input: { wallet: ProviderWalletLink; idempotencyKey: string; asset: CapitalAsset; network: CapitalNetwork; amount: string; destination: string }): Promise<ProviderTransaction>;
  getTransfer(providerReference: string): Promise<ProviderTransaction>;
  listTransactions(providerWalletId: string): Promise<ProviderTransaction[]>;
  reconciliationMetadata(wallet: ProviderWalletLink): Record<string, string>;
}

export class DisabledCapitalProvider implements CapitalProvider {
  readonly identity = 'disabled'; readonly environment = 'testnet' as const;
  readiness(): ProviderState { return 'not_configured'; }
  supports(): boolean { return false; }
  private unavailable(): never { throw new ApiError(503, 'provider_not_configured', 'Capital provider is not configured'); }
  async provisionWallet(): Promise<never> { return this.unavailable(); }
  async lookupWallet(): Promise<never> { return this.unavailable(); }
  async getDepositAddress(): Promise<never> { return this.unavailable(); }
  async getBalances(): Promise<never> { return this.unavailable(); }
  async createTransfer(): Promise<never> { return this.unavailable(); }
  async getTransfer(): Promise<never> { return this.unavailable(); }
  async listTransactions(): Promise<never> { return this.unavailable(); }
  reconciliationMetadata(): Record<string, string> { return {}; }
}

export interface WebhookVerificationInput { rawBody: Buffer; headers: Readonly<Record<string, string | undefined>>; now?: number; }
export interface WebhookVerifier { verify(input: WebhookVerificationInput): void | Promise<void>; }

/** Test/local verifier only. Production provider adapters must implement the provider's reviewed contract. */
export class TimestampedHmacTestVerifier implements WebhookVerifier {
  constructor(private readonly secret: string, private readonly toleranceSeconds = 300) {}
  verify({ rawBody, headers, now = Date.now() }: WebhookVerificationInput) {
    const signature = headers['x-webhook-signature']; const timestamp = headers['x-webhook-timestamp'];
    if (!signature || !timestamp || !/^\d+$/.test(timestamp)) throw new ApiError(401, 'invalid_webhook', 'Missing webhook verification headers');
    if (Math.abs(now - Number(timestamp) * 1000) > this.toleranceSeconds * 1000) throw new ApiError(401, 'invalid_webhook', 'Webhook timestamp is outside tolerance');
    const expected = createHmac('sha256', this.secret).update(`${timestamp}.`).update(rawBody).digest();
    const supplied = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ApiError(401, 'invalid_webhook', 'Invalid webhook signature');
  }
}

export type ReconciliationClassification = 'missing_provider_record' | 'missing_internal_record' | 'duplicate_provider_event' | 'duplicate_internal_event' | 'confirmation_mismatch' | 'amount_mismatch' | 'asset_mismatch' | 'network_mismatch' | 'pending_timeout' | 'unknown_state';
export function classifyMismatch(provider: Record<string, unknown> | undefined, internal: Record<string, unknown> | undefined): ReconciliationClassification | undefined {
  if (!provider) return 'missing_provider_record'; if (!internal) return 'missing_internal_record';
  for (const [field, result] of [['amount', 'amount_mismatch'], ['asset', 'asset_mismatch'], ['network', 'network_mismatch'], ['confirmations', 'confirmation_mismatch']] as const)
    if (provider[field] !== internal[field]) return result;
  return undefined;
}
