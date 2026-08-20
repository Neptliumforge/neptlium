import { ApiError } from './errors.js';
import type {
  AccountContext,
  AccountSettingsRecord,
  ApiRepository,
  AuditEvent,
  CustomerActivityPage,
  CustomerActivityQuery,
  CustomerDocumentRecord,
  CustomerNotificationRecord,
  Deposit,
  IdempotentResult,
  OnboardingDraftRecord,
  SecurityActivityRecord,
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
type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  investor_type: string | null;
  organization_id: string | null;
  compliance_status: string | null;
  provisioned_at: string | null;
};
type RoleRow = { role: string | null };
type ActivityRow = {
  id: string;
  type: string;
  asset: string;
  network: string;
  amount: string | number;
  status: string;
  reference: string | null;
  counterparty: string | null;
  created_at: string;
};
type NotificationRow = {
  id: string;
  category: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};
type DocumentRow = {
  id: string;
  category: string;
  title: string;
  created_at: string;
};
type OrganizationRow = {
  id: string;
  name: string | null;
  role: string | null;
  website: string | null;
  industry: string | null;
  country: string | null;
  organization_size: string | null;
  aum_range: string | null;
};
type SecurityActivityRow = {
  id: string;
  event_type: string;
  user_agent: string | null;
  created_at: string;
};
type OnboardingDraftRow = { data: Record<string, unknown> | null; step_index: number | null };

export class SupabaseRepository implements ApiRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {
    if (!url || !serviceRoleKey)
      throw new Error('Durable repository requires Supabase server credentials');
  }

  private headers(extra: HeadersInit = {}): HeadersInit {
    return {
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      'content-type': 'application/json',
      ...extra,
    };
  }

  private async rest(path: string, init: RequestInit = {}) {
    return this.request(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: this.headers(init.headers),
      signal: AbortSignal.timeout(8_000),
    });
  }

  private async storage(path: string, init: RequestInit = {}) {
    return this.request(`${this.url}/storage/v1/${path}`, {
      ...init,
      headers: this.headers(init.headers),
      signal: AbortSignal.timeout(8_000),
    });
  }

  private async jsonRows<T>(path: string, message = 'Account data is unavailable'): Promise<T[]> {
    const response = await this.rest(path);
    if (!response.ok) throw new ApiError(503, 'data_unavailable', message);
    return (await response.json()) as T[];
  }

  async ready() {
    try {
      const probes = await Promise.all([
        this.rest('profiles?select=id&limit=1'),
        this.rest('user_roles?select=user_id&limit=1'),
      ]);
      return probes.every((response) => response.ok);
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

  async getAccountContext(ownerId: string): Promise<AccountContext> {
    const [profiles, roles] = await Promise.all([
      this.jsonRows<ProfileRow>(
        `profiles?id=eq.${encodeURIComponent(ownerId)}&select=id,email,full_name,display_name,investor_type,organization_id,compliance_status,provisioned_at&limit=1`,
        'Account profile is unavailable',
      ),
      this.jsonRows<RoleRow>(
        `user_roles?user_id=eq.${encodeURIComponent(ownerId)}&select=role&limit=1`,
        'Account role is unavailable',
      ),
    ]);
    const profile = profiles[0];
    if (!profile)
      throw new ApiError(404, 'account_not_provisioned', 'Account profile is not provisioned');
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      displayName: profile.display_name,
      investorType: profile.investor_type,
      organizationId: profile.organization_id,
      complianceStatus: profile.compliance_status,
      provisionedAt: profile.provisioned_at,
      role: roles[0]?.role ?? 'user',
    };
  }

  async getOnboardingDraft(ownerId: string): Promise<OnboardingDraftRecord> {
    const rows = await this.jsonRows<OnboardingDraftRow>(
      `onboarding_drafts?user_id=eq.${encodeURIComponent(ownerId)}&select=data,step_index&limit=1`,
      'Onboarding draft is unavailable',
    );
    return {
      data: rows[0]?.data ?? {},
      stepIndex: rows[0]?.step_index ?? 0,
    };
  }

  async saveOnboardingDraft(ownerId: string, draft: OnboardingDraftRecord) {
    const response = await this.rest('onboarding_drafts?on_conflict=user_id', {
      method: 'POST',
      headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: ownerId,
        data: draft.data,
        step_index: draft.stepIndex,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok)
      throw new ApiError(503, 'data_unavailable', 'Onboarding draft could not be saved');
  }

  async listCustomerActivity(
    ownerId: string,
    query: CustomerActivityQuery,
  ): Promise<CustomerActivityPage> {
    const filters = [`profile_id=eq.${encodeURIComponent(ownerId)}`];
    if (query.status) filters.push(`status=eq.${encodeURIComponent(query.status)}`);
    if (query.asset) filters.push(`asset=eq.${encodeURIComponent(query.asset)}`);
    if (query.network) filters.push(`network=eq.${encodeURIComponent(query.network)}`);
    if (query.search) {
      const escaped = query.search.replace(/[(),]/g, ' ').trim();
      filters.push(
        `or=${encodeURIComponent(`(reference.ilike.*${escaped}*,counterparty.ilike.*${escaped}*)`)}`,
      );
    }
    const select = 'id,type,asset,network,amount,status,reference,counterparty,created_at';
    const response = await this.rest(
      `wallet_transactions?${filters.join('&')}&select=${select}&order=created_at.desc&offset=${query.offset}&limit=${query.limit}`,
      { headers: { prefer: 'count=exact' } },
    );
    if (!response.ok)
      throw new ApiError(503, 'data_unavailable', 'Capital activity is unavailable');
    const rows = (await response.json()) as ActivityRow[];
    const totalHeader = response.headers.get('content-range')?.split('/')[1];
    const total = totalHeader && totalHeader !== '*' ? Number(totalHeader) : rows.length;
    const facets = await this.jsonRows<Pick<ActivityRow, 'asset' | 'network'>>(
      `wallet_transactions?profile_id=eq.${encodeURIComponent(ownerId)}&select=asset,network&limit=500`,
      'Capital activity filters are unavailable',
    );
    return {
      data: rows.map((row) => ({
        id: row.id,
        type: row.type,
        asset: row.asset,
        network: row.network,
        amount: String(row.amount),
        status: row.status,
        reference: row.reference,
        counterparty: row.counterparty,
        createdAt: row.created_at,
      })),
      total: Number.isFinite(total) ? total : rows.length,
      assets: [...new Set(facets.map((row) => row.asset))].sort(),
      networks: [...new Set(facets.map((row) => row.network))].sort(),
    };
  }

  async getAccountSettings(ownerId: string): Promise<AccountSettingsRecord> {
    const profile = await this.getAccountContext(ownerId);
    const [organizationRows, securityRows] = await Promise.all([
      profile.organizationId
        ? this.jsonRows<OrganizationRow>(
            `organizations?id=eq.${encodeURIComponent(profile.organizationId)}&select=id,name,role,website,industry,country,organization_size,aum_range&limit=1`,
            'Organization settings are unavailable',
          )
        : Promise.resolve([]),
      this.jsonRows<SecurityActivityRow>(
        `login_history?user_id=eq.${encodeURIComponent(ownerId)}&select=id,event_type,user_agent,created_at&order=created_at.desc&limit=10`,
        'Security activity is unavailable',
      ),
    ]);
    const organization = organizationRows[0];
    return {
      profile,
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            role: organization.role,
            website: organization.website,
            industry: organization.industry,
            country: organization.country,
            organizationSize: organization.organization_size,
            aumRange: organization.aum_range,
          }
        : null,
      securityActivity: securityRows.map((row): SecurityActivityRecord => ({
        id: row.id,
        eventType: row.event_type,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      })),
    };
  }

  async listNotifications(ownerId: string): Promise<CustomerNotificationRecord[]> {
    const rows = await this.jsonRows<NotificationRow>(
      `notifications?user_id=eq.${encodeURIComponent(ownerId)}&select=id,category,title,body,read_at,created_at&order=created_at.desc&limit=50`,
      'Notifications are unavailable',
    );
    return rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      body: row.body,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));
  }

  async markNotificationRead(ownerId: string, notificationId: string) {
    const response = await this.rest(
      `notifications?id=eq.${encodeURIComponent(notificationId)}&user_id=eq.${encodeURIComponent(ownerId)}`,
      {
        method: 'PATCH',
        headers: { prefer: 'return=minimal' },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
      },
    );
    if (!response.ok)
      throw new ApiError(503, 'data_unavailable', 'Notification could not be updated');
  }

  async markAllNotificationsRead(ownerId: string) {
    const response = await this.rest(
      `notifications?user_id=eq.${encodeURIComponent(ownerId)}&read_at=is.null`,
      {
        method: 'PATCH',
        headers: { prefer: 'return=minimal' },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
      },
    );
    if (!response.ok)
      throw new ApiError(503, 'data_unavailable', 'Notifications could not be updated');
  }

  async listDocuments(ownerId: string): Promise<CustomerDocumentRecord[]> {
    const rows = await this.jsonRows<DocumentRow>(
      `documents?profile_id=eq.${encodeURIComponent(ownerId)}&select=id,category,title,created_at&order=created_at.desc`,
      'Documents are unavailable',
    );
    return rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      createdAt: row.created_at,
    }));
  }

  async createDocumentDownloadUrl(
    ownerId: string,
    documentId: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const rows = await this.jsonRows<{ storage_path: string }>(
      `documents?id=eq.${encodeURIComponent(documentId)}&profile_id=eq.${encodeURIComponent(ownerId)}&select=storage_path&limit=1`,
      'Document lookup is unavailable',
    );
    const storagePath = rows[0]?.storage_path;
    if (!storagePath) throw new ApiError(404, 'not_found', 'Document not found');
    const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
    const response = await this.storage(`object/sign/documents/${encodedPath}`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    });
    if (!response.ok)
      throw new ApiError(503, 'data_unavailable', 'Document download is unavailable');
    const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
    const signed = payload.signedURL ?? payload.signedUrl;
    if (!signed) throw new ApiError(503, 'data_unavailable', 'Document download is unavailable');
    return signed.startsWith('http') ? signed : `${this.url}/storage/v1${signed}`;
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
