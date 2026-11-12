import { ApiError } from './errors.js';
import { verifyClerkJwtRs256, type ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Preview-only composition boundary. It is deliberately not registered with
 * the production request authenticator. Existing principals are never created
 * or linked here.
 */
export interface ClerkPreviewIdentityStore {
  resolveActiveClerkPrincipal(subject: string): Promise<string | null>;
  isActiveOrganizationMember(principalId: string, organizationId: string): Promise<boolean>;
}

export class SupabaseClerkPreviewIdentityStore implements ClerkPreviewIdentityStore {
  constructor(
    private readonly url: string,
    private readonly serviceKey: string,
    private readonly request: typeof fetch = fetch,
  ) {
    if (!/^https:\/\//.test(url) || !serviceKey) throw new Error('preview identity store is not configured');
  }

  private async rows(path: string): Promise<unknown[]> {
    let response: Response;
    try {
      response = await this.request(`${this.url}/rest/v1/${path}`, {
        headers: { apikey: this.serviceKey, authorization: `Bearer ${this.serviceKey}` },
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new ApiError(503, 'identity_storage_unavailable', 'Identity storage is unavailable');
    }
    if (!response.ok) throw new ApiError(503, 'identity_storage_unavailable', 'Identity storage is unavailable');
    const data: unknown = await response.json().catch(() => null);
    if (!Array.isArray(data)) throw new ApiError(503, 'identity_storage_unavailable', 'Invalid identity storage response');
    return data;
  }

  async resolveActiveClerkPrincipal(subject: string): Promise<string | null> {
    if (!/^user_[A-Za-z0-9]{8,128}$/.test(subject)) return null;
    const links = await this.rows(
      `identity_provider_subjects?provider=eq.CLERK&provider_subject=eq.${encodeURIComponent(subject)}&status=eq.ACTIVE&select=principal_id&limit=2`,
    );
    if (links.length !== 1) return null;
    const id = (links[0] as { principal_id?: unknown })?.principal_id;
    if (typeof id !== 'string' || !UUID.test(id)) return null;
    const principals = await this.rows(
      `identity_principals?id=eq.${encodeURIComponent(id)}&status=eq.ACTIVE&select=id,suspended_at,retired_at&limit=2`,
    );
    if (principals.length !== 1) return null;
    const principal = principals[0] as { id?: unknown; suspended_at?: unknown; retired_at?: unknown };
    return principal.id === id && principal.suspended_at == null && principal.retired_at == null ? id : null;
  }

  async isActiveOrganizationMember(principalId: string, organizationId: string): Promise<boolean> {
    if (!UUID.test(principalId) || !UUID.test(organizationId)) return false;
    // The membership table refers to auth.users.id, not the Neptlium principal.
    // Resolve the active Supabase Auth subject through the SAME principal first.
    const subjects = await this.rows(
      `identity_provider_subjects?principal_id=eq.${encodeURIComponent(principalId)}&provider=eq.SUPABASE_AUTH&status=eq.ACTIVE&select=provider_subject&limit=2`,
    );
    if (subjects.length !== 1) return false;
    const userId = (subjects[0] as { provider_subject?: unknown }).provider_subject;
    if (typeof userId !== 'string' || !UUID.test(userId)) return false;
    const memberships = await this.rows(
      `organization_memberships?organization_id=eq.${encodeURIComponent(organizationId)}&user_id=eq.${encodeURIComponent(userId)}&status=eq.active&revoked_at=is.null&suspended_at=is.null&select=id,organization_id,user_id,status&limit=2`,
    );
    if (memberships.length !== 1) return false;
    const membership = memberships[0] as { organization_id?: unknown; user_id?: unknown; status?: unknown };
    return membership.organization_id === organizationId && membership.user_id === userId && membership.status === 'active';
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function authenticateClerkPreviewTenant(
  token: string,
  organizationId: string,
  trust: ClerkJwtTrust,
  store: ClerkPreviewIdentityStore,
  environment: string | undefined,
): Promise<{ principalId: string; organizationId: string } | null> {
  if (environment !== 'preview' || !UUID.test(organizationId)) return null;
  const verified = verifyClerkJwtRs256(token, trust);
  if (!verified.valid) return null;
  const principalId = await store.resolveActiveClerkPrincipal(verified.subject);
  if (!principalId || !UUID.test(principalId)) return null;
  if (!await store.isActiveOrganizationMember(principalId, organizationId)) return null;
  return { principalId, organizationId };
}
