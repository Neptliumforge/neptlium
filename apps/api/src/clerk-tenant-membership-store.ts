import type { ClerkTenantMembershipStore } from './clerk-preview-tenant-gate.js';

/**
 * Server-only read-only RPC adapter. The database function must independently
 * check active principal, active tenant, and active membership in one snapshot.
 * No RPC is installed by this file: absent function/permissions deny access.
 * Never use this adapter with a browser-exposed key.
 */
export class SupabaseClerkTenantMembershipStore implements ClerkTenantMembershipStore {
  constructor(
    private readonly url: string,
    private readonly serviceKey: string,
    private readonly request: typeof fetch = fetch,
  ) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !serviceKey) throw new Error('tenant membership store not configured');
  }

  async hasActiveMembership(principalId: string, tenantId: string): Promise<boolean> {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuid.test(principalId) || !uuid.test(tenantId)) return false;
    const endpoint = new URL('/rest/v1/rpc/authorize_clerk_preview_tenant_membership', this.url);
    const response = await this.request(endpoint.toString(), {
      method: 'POST',
      headers: {
        apikey: this.serviceKey,
        authorization: `Bearer ${this.serviceKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_principal_id: principalId, p_tenant_id: tenantId }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('tenant membership authorization unavailable');
    const result: unknown = await response.json().catch(() => null);
    if (typeof result !== 'boolean') throw new Error('invalid tenant membership authorization result');
    return result;
  }
}
