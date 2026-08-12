import { ApiError } from './errors.js';

type Fetch = typeof fetch;
type Row = Record<string, unknown>;

export interface AdminRepository {
  getRole(userId: string): Promise<string | null>;
  getSession(userId: string): Promise<Record<string, unknown>>;
  getDashboard(): Promise<Record<string, unknown>>;
  listUsers(query: URLSearchParams): Promise<Record<string, unknown>>;
  getUser(userId: string): Promise<Record<string, unknown> | null>;
  updateUserRole(userId: string, role: string): Promise<void>;
  setCompliance(userId: string, status: 'active' | 'suspended'): Promise<void>;
  listDeposits(query: URLSearchParams): Promise<Record<string, unknown>>;
  listWithdrawals(query: URLSearchParams, pendingOnly?: boolean): Promise<Record<string, unknown>>;
  listTransactions(query: URLSearchParams): Promise<Record<string, unknown>>;
  listAllocations(query: URLSearchParams, pendingOnly?: boolean): Promise<unknown>;
  reviewAllocation(id: string, actorId: string, decision: 'approved' | 'rejected', reason?: string): Promise<void>;
  listLoginHistory(query: URLSearchParams): Promise<unknown[]>;
  listTrustedDevices(): Promise<unknown[]>;
  audit(actorId: string, operation: string, resourceType: string, resourceId: string | null, requestId: string, metadata?: Record<string, unknown>): Promise<void>;
}

export class DisabledAdminRepository implements AdminRepository {
  private unavailable(): never { throw new ApiError(503, 'admin_storage_unavailable', 'Administrative storage is unavailable'); }
  async getRole(): Promise<string | null> { return this.unavailable(); }
  async getSession(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async getDashboard(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async listUsers(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async getUser(): Promise<Record<string, unknown> | null> { return this.unavailable(); }
  async updateUserRole(): Promise<void> { return this.unavailable(); }
  async setCompliance(): Promise<void> { return this.unavailable(); }
  async listDeposits(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async listWithdrawals(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async listTransactions(): Promise<Record<string, unknown>> { return this.unavailable(); }
  async listAllocations(): Promise<unknown> { return this.unavailable(); }
  async reviewAllocation(): Promise<void> { return this.unavailable(); }
  async listLoginHistory(): Promise<unknown[]> { return this.unavailable(); }
  async listTrustedDevices(): Promise<unknown[]> { return this.unavailable(); }
  async audit(): Promise<void> { return this.unavailable(); }
}

export class SupabaseAdminRepository implements AdminRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {
    if (!url || !serviceRoleKey) throw new Error('Admin repository requires server credentials');
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

  private async rows<T = Row>(path: string): Promise<T[]> {
    const response = await this.rest(path);
    if (!response.ok) throw new ApiError(503, 'admin_data_unavailable', 'Administrative data is unavailable');
    return (await response.json()) as T[];
  }

  private async page(path: string, page: number) {
    const offset = Math.max(0, page) * 50;
    const response = await this.rest(path, { headers: { prefer: 'count=exact', range: `${offset}-${offset + 49}` } });
    if (!response.ok) throw new ApiError(503, 'admin_data_unavailable', 'Administrative data is unavailable');
    const total = Number(response.headers.get('content-range')?.split('/')[1] ?? 0);
    return { rows: (await response.json()) as Row[], total: Number.isFinite(total) ? total : 0 };
  }

  private async profileMap(ids: string[]) {
    if (!ids.length) return new Map<string, Row>();
    const rows = await this.rows<Row>(`profiles?id=in.(${ids.map(encodeURIComponent).join(',')})&select=id,email,full_name`);
    return new Map(rows.map((row) => [String(row.id), row]));
  }

  async getRole(userId: string) {
    const roles = await this.rows<{ role: string }>(`user_roles?user_id=eq.${encodeURIComponent(userId)}&select=role&limit=2`);
    if (roles.length > 1) throw new ApiError(403, 'admin_role_ambiguous', 'Administrative authorization is ambiguous');
    return roles[0]?.role ?? null;
  }

  async getSession(userId: string) {
    const rows = await this.rows<Row>(`profiles?id=eq.${encodeURIComponent(userId)}&select=id,email,full_name,display_name&limit=1`);
    const profile = rows[0] ?? { id: userId, email: null, full_name: null, display_name: null };
    return { id: userId, email: profile.email ?? null, fullName: profile.full_name ?? null, displayName: profile.display_name ?? null, role: 'super_admin' };
  }

  async getDashboard() {
    const [profiles, compliance, withdrawals, allocations, recent] = await Promise.all([
      this.rest('profiles?select=id', { method: 'HEAD', headers: { prefer: 'count=exact' } }),
      this.rest('profiles?compliance_status=eq.pending&select=id', { method: 'HEAD', headers: { prefer: 'count=exact' } }),
      this.rest('wallet_transactions?type=eq.withdrawal&status=in.(pending,pending_review)&select=id', { method: 'HEAD', headers: { prefer: 'count=exact' } }),
      this.rest('capital_allocation_requests?status=eq.pending_review&select=id', { method: 'HEAD', headers: { prefer: 'count=exact' } }),
      this.rows<Row>('wallet_transactions?select=id,type,asset,amount,status,created_at&order=created_at.desc&limit=20'),
    ]);
    const count = (response: Response) => Number(response.headers.get('content-range')?.split('/')[1] ?? 0) || 0;
    return { totalUsers: count(profiles), pendingCompliance: count(compliance), pendingWithdrawals: count(withdrawals), pendingAllocations: count(allocations), recentTransactions: recent };
  }

  async listUsers(query: URLSearchParams) {
    const page = Number(query.get('page') ?? 0);
    const filters = ['select=id,email,full_name,display_name,compliance_status,investor_type,provisioned_at', 'order=provisioned_at.desc.nullslast'];
    const status = query.get('status');
    if (status) filters.push(`compliance_status=eq.${encodeURIComponent(status)}`);
    const search = query.get('search');
    if (search) {
      const safe = search.replaceAll(',', ' ').replaceAll('(', '').replaceAll(')', '');
      filters.push(`or=${encodeURIComponent(`(email.ilike.*${safe}*,full_name.ilike.*${safe}*)`)}`);
    }
    const result = await this.page(`profiles?${filters.join('&')}`, page);
    const ids = result.rows.map((row) => String(row.id));
    const roles = ids.length ? await this.rows<Row>(`user_roles?user_id=in.(${ids.map(encodeURIComponent).join(',')})&select=user_id,role`) : [];
    const roleMap = new Map(roles.map((row) => [String(row.user_id), row.role]));
    return { rows: result.rows.map((row) => ({ ...row, role: roleMap.get(String(row.id)) ?? null })), total: result.total };
  }

  async getUser(userId: string) {
    const [profiles, roles, wallets, transactions, loginHistory] = await Promise.all([
      this.rows<Row>(`profiles?id=eq.${encodeURIComponent(userId)}&select=id,email,full_name,display_name,compliance_status,investor_type,provisioned_at&limit=1`),
      this.rows<Row>(`user_roles?user_id=eq.${encodeURIComponent(userId)}&select=role&limit=2`),
      this.rows<Row>(`wallets?profile_id=eq.${encodeURIComponent(userId)}&select=id,provider,created_at`),
      this.rows<Row>(`wallet_transactions?profile_id=eq.${encodeURIComponent(userId)}&select=id,type,asset,amount,status,created_at&order=created_at.desc&limit=25`),
      this.rows<Row>(`login_history?user_id=eq.${encodeURIComponent(userId)}&select=id,event_type,user_agent,created_at&order=created_at.desc&limit=10`),
    ]);
    if (!profiles[0]) return null;
    if (roles.length > 1) throw new ApiError(409, 'role_state_ambiguous', 'User role state is ambiguous');
    return { ...profiles[0], role: roles[0]?.role ?? null, wallets, transactions, loginHistory };
  }

  async updateUserRole(userId: string, role: string) {
    if (!['user','operator','analyst','manager'].includes(role)) throw new ApiError(422, 'admin_delegation_disabled', 'Administrator delegation is disabled');
    const existing = await this.rows<Row>(`user_roles?user_id=eq.${encodeURIComponent(userId)}&select=id,role&limit=2`);
    if (existing.length > 1) throw new ApiError(409, 'role_state_ambiguous', 'User role state is ambiguous');
    if (existing[0]?.role === 'super_admin') throw new ApiError(409, 'super_admin_protected', 'The General Platform Administrator cannot be changed here');
    const response = existing[0]
      ? await this.rest(`user_roles?id=eq.${encodeURIComponent(String(existing[0].id))}`, { method: 'PATCH', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ role }) })
      : await this.rest('user_roles', { method: 'POST', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ user_id: userId, role }) });
    if (!response.ok) throw new ApiError(503, 'role_update_failed', 'Role update failed');
  }

  async setCompliance(userId: string, status: 'active' | 'suspended') {
    const response = await this.rest(`profiles?id=eq.${encodeURIComponent(userId)}`, { method: 'PATCH', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ compliance_status: status }) });
    if (!response.ok) throw new ApiError(503, 'compliance_update_failed', 'Account state update failed');
  }

  private async listLegacyTransactions(query: URLSearchParams, type?: string) {
    const page = Number(query.get('page') ?? 0);
    const filters = ['select=id,profile_id,type,asset,amount,status,reference,counterparty,created_at','order=created_at.desc'];
    if (type) filters.push(`type=eq.${type}`);
    const status = query.get('status');
    if (status) filters.push(`status=eq.${encodeURIComponent(status)}`);
    const result = await this.page(`wallet_transactions?${filters.join('&')}`, page);
    const profiles = await this.profileMap([...new Set(result.rows.map((row) => String(row.profile_id)))]);
    return { rows: result.rows.map((row) => { const profile = profiles.get(String(row.profile_id)); return { ...row, user_email: profile?.email ?? null, user_name: profile?.full_name ?? null }; }), total: result.total };
  }

  async listDeposits(query: URLSearchParams) {
    const result = await this.listLegacyTransactions(query, 'deposit');
    return { rows: result.rows.map(({ counterparty: _counterparty, type: _type, ...row }) => row), total: result.total };
  }

  async listWithdrawals(query: URLSearchParams, pendingOnly = false) {
    const copy = new URLSearchParams(query);
    const result = await this.listLegacyTransactions(copy, 'withdrawal');
    const rows = result.rows.map(({ type: _type, ...row }) => ({ ...row, governed: false }));
    const pending = rows.filter((row) => ['pending','pending_review'].includes(String(row.status)));
    return pendingOnly
      ? { rows: pending, totalAmount: pending.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) }
      : { rows, total: result.total };
  }

  async listTransactions(query: URLSearchParams) {
    const result = await this.listLegacyTransactions(query, query.get('type') ?? undefined);
    return { rows: result.rows.map(({ counterparty: _counterparty, ...row }) => row), total: result.total };
  }

  async listAllocations(query: URLSearchParams, pendingOnly = false) {
    const page = Number(query.get('page') ?? 0);
    const filters = ['select=id,profile_id,asset,amount,status,notes,reviewed_by,reviewed_at,created_at','order=created_at.desc'];
    if (pendingOnly) filters.push('status=eq.pending_review');
    else if (query.get('status')) filters.push(`status=eq.${encodeURIComponent(query.get('status')!)}`);
    const result = await this.page(`capital_allocation_requests?${filters.join('&')}`, page);
    const profiles = await this.profileMap([...new Set(result.rows.map((row) => String(row.profile_id)))]);
    const rows = result.rows.map((row) => { const profile = profiles.get(String(row.profile_id)); return { ...row, user_email: profile?.email ?? null, user_name: profile?.full_name ?? null }; });
    return pendingOnly ? rows : { rows, total: result.total };
  }

  async reviewAllocation(id: string, actorId: string, decision: 'approved' | 'rejected', reason?: string) {
    const body: Row = { status: decision, reviewed_by: actorId, reviewed_at: new Date().toISOString() };
    if (decision === 'rejected') body.notes = reason ?? 'Rejected by General Platform Administrator';
    const response = await this.rest(`capital_allocation_requests?id=eq.${encodeURIComponent(id)}&status=eq.pending_review`, { method: 'PATCH', headers: { prefer: 'return=representation' }, body: JSON.stringify(body) });
    if (!response.ok) throw new ApiError(503, 'allocation_review_failed', 'Allocation review could not be recorded');
    if (!((await response.json()) as Row[]).length) throw new ApiError(409, 'allocation_state_conflict', 'Allocation is not pending review');
  }

  async listLoginHistory(query: URLSearchParams) {
    const limit = Math.min(250, Math.max(1, Number(query.get('limit') ?? 100)));
    const userId = query.get('user_id');
    const rows = await this.rows<Row>(`login_history?select=id,user_id,event_type,user_agent,created_at&order=created_at.desc&limit=${limit}${userId ? `&user_id=eq.${encodeURIComponent(userId)}` : ''}`);
    const profiles = await this.profileMap([...new Set(rows.map((row) => String(row.user_id)))]);
    return rows.map((row) => ({ ...row, user_email: profiles.get(String(row.user_id))?.email ?? null }));
  }

  async listTrustedDevices() {
    const rows = await this.rows<Row>('trusted_devices?select=id,user_id,device_id,user_agent,last_seen_at&order=last_seen_at.desc');
    const profiles = await this.profileMap([...new Set(rows.map((row) => String(row.user_id)))]);
    return rows.map((row) => ({ ...row, user_email: profiles.get(String(row.user_id))?.email ?? null }));
  }

  async audit(actorId: string, operation: string, resourceType: string, resourceId: string | null, requestId: string, metadata: Record<string, unknown> = {}) {
    const response = await this.rest('api_audit_events', { method: 'POST', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ actor_id: actorId, actor_type: 'user', operation, resource_type: resourceType, resource_id: resourceId, old_state: null, new_state: JSON.stringify(metadata), request_id: requestId }) });
    if (!response.ok) throw new ApiError(503, 'audit_unavailable', 'Administrative audit storage is unavailable');
  }
}
