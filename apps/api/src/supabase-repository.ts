import { ApiError } from './errors.js';
import type {
  ApiRepository,
  AuditEvent,
  Deposit,
  IdempotentResult,
  WebhookInsertResult,
  WebhookRecord,
  Withdrawal,
} from './repositories.js';
import type { ProviderWalletLink } from './providers.js';

type Fetch = typeof fetch;
type WalletRow = { id: string };
type LinkRow = {
  provider: string;
  provider_wallet_id: string;
  provider_wallet_set_id: string | null;
  provider_account_type: string;
  blockchain: string;
  address: string;
  environment: string;
  status: string;
};

export class SupabaseRepository implements ApiRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {
    if (!url || !serviceRoleKey)
      throw new Error('Durable repository requires Supabase server credentials');
  }

  private async rest(path: string, init: RequestInit = {}) {
    return this.request(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        'content-type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(8_000),
    });
  }
  async ready() {
    try {
      return (await this.rest('wallet_accounts?select=id&limit=1')).ok;
    } catch {
      return false;
    }
  }
  private async walletId(ownerId: string): Promise<string | undefined> {
    const response = await this.rest(
      `wallet_accounts?owner_id=eq.${encodeURIComponent(ownerId)}&select=id&limit=1`,
    );
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Capital Account storage is unavailable');
    return ((await response.json()) as WalletRow[])[0]?.id;
  }
  private normalize(row: LinkRow): ProviderWalletLink {
    if (
      row.provider !== 'circle' ||
      row.provider_account_type !== 'EOA' ||
      row.blockchain !== 'BASE-SEPOLIA' ||
      row.environment !== 'testnet' ||
      !['live', 'pending', 'disabled'].includes(row.status)
    )
      throw new ApiError(503, 'provider_unavailable', 'Capital Account linkage is invalid');
    return {
      provider: 'circle',
      providerWalletId: row.provider_wallet_id,
      ...(row.provider_wallet_set_id ? { providerWalletSetId: row.provider_wallet_set_id } : {}),
      accountType: 'EOA',
      blockchain: 'BASE-SEPOLIA',
      address: row.address,
      environment: 'testnet',
      status: row.status as ProviderWalletLink['status'],
    };
  }
  async getProviderWallet(ownerId: string) {
    const walletId = await this.walletId(ownerId);
    if (!walletId) return undefined;
    const response = await this.rest(
      `capital_provider_wallets?wallet_id=eq.${encodeURIComponent(walletId)}&provider=eq.circle&select=provider,provider_wallet_id,provider_wallet_set_id,provider_account_type,blockchain,address,environment,status&limit=1`,
    );
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Capital Account storage is unavailable');
    const row = ((await response.json()) as LinkRow[])[0];
    return row ? this.normalize(row) : undefined;
  }
  async linkProviderWallet(ownerId: string, link: ProviderWalletLink) {
    const walletId = await this.walletId(ownerId);
    if (!walletId)
      throw new ApiError(
        409,
        'provider_wallet_conflict',
        'Canonical Capital Account does not exist',
      );
    const existing = await this.getProviderWallet(ownerId);
    if (existing) {
      if (JSON.stringify(existing) === JSON.stringify(link)) return existing;
      throw new ApiError(
        409,
        'provider_wallet_conflict',
        'Capital Account already has a different provider wallet',
      );
    }
    const response = await this.rest('capital_provider_wallets', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        wallet_id: walletId,
        provider: link.provider,
        provider_wallet_id: link.providerWalletId,
        provider_wallet_set_id: link.providerWalletSetId ?? null,
        provider_account_type: link.accountType,
        blockchain: link.blockchain,
        address: link.address,
        environment: link.environment,
        status: link.status,
      }),
    });
    if (response.status === 409)
      throw new ApiError(
        409,
        'provider_wallet_conflict',
        'Provider wallet linkage conflicts with an existing account',
      );
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Capital Account storage is unavailable');
    const row = ((await response.json()) as LinkRow[])[0];
    if (!row)
      throw new ApiError(503, 'provider_unavailable', 'Capital Account storage is unavailable');
    return this.normalize(row);
  }
  private async rpc(name: string, body: unknown) {
    const response = await this.rest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Account operation is unavailable');
    const result = (await response.json()) as
      { profile_id?: string } | Array<{ profile_id?: string }>;
    const profileId = Array.isArray(result) ? result[0]?.profile_id : result.profile_id;
    if (!profileId)
      throw new ApiError(503, 'provider_unavailable', 'Account operation is unavailable');
    return { profileId };
  }
  provisionAccount(ownerId: string) {
    return this.rpc('provision_account', { target_user_id: ownerId });
  }
  completeOnboarding(ownerId: string, payload: unknown) {
    return this.rpc('complete_account_onboarding', {
      target_user_id: ownerId,
      onboarding_payload: payload,
    });
  }
  private unsupported(): never {
    throw new ApiError(503, 'provider_unavailable', 'Durable operation is unavailable');
  }
  async createWithdrawalIdempotently(): Promise<IdempotentResult<Withdrawal>> {
    return this.unsupported();
  }
  async getWithdrawal(): Promise<Withdrawal> {
    return this.unsupported();
  }
  async cancelWithdrawalIdempotently(): Promise<IdempotentResult<Withdrawal>> {
    return this.unsupported();
  }
  async listDeposits(): Promise<Deposit[]> {
    return this.unsupported();
  }
  async listTransactions(): Promise<Withdrawal[]> {
    return this.unsupported();
  }
  async audit(input: Omit<AuditEvent, 'id' | 'createdAt'>) {
    const response = await this.rest('api_audit_events', {
      method: 'POST',
      body: JSON.stringify({
        actor_id: input.actorId,
        actor_type: 'user',
        operation: input.operation,
        resource_type: 'capital_provider_wallet',
        resource_id: input.resourceId,
        old_state: input.oldState ?? null,
        new_state: input.newState ?? null,
        request_id: input.requestId,
      }),
    });
    if (!response.ok)
      throw new ApiError(503, 'provider_unavailable', 'Audit storage is unavailable');
  }
  async recordWebhook(_record: WebhookRecord, _requestId: string): Promise<WebhookInsertResult> {
    return this.unsupported();
  }
}
