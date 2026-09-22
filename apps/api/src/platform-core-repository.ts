import { ApiError } from './errors.js';
import type { OrganizationMembership, PlatformOwnerRef, OrganizationRole } from './platform-core-domain.js';

type Fetch = typeof fetch;

type PlatformOwnerRow = {
  id: string;
  owner_type: 'individual' | 'organization';
  individual_user_id: string | null;
  organization_id: string | null;
  status: 'active' | 'suspended' | 'retired';
};

type MembershipRow = {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: 'active' | 'suspended' | 'revoked';
};

export interface ResolvedPlatformOwner {
  readonly platformOwnerId: string;
  readonly owner: PlatformOwnerRef;
}

export interface PlatformCoreRepository {
  ready(): Promise<boolean>;
  resolveIndividual(userId: string): Promise<ResolvedPlatformOwner>;
  resolveOrganization(userId: string, organizationId: string): Promise<{ owner: ResolvedPlatformOwner; membership: OrganizationMembership }>;
}

export class SupabasePlatformCoreRepository implements PlatformCoreRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {}

  private headers(): HeadersInit {
    return {
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      'content-type': 'application/json',
    };
  }

  private async rows<T>(path: string, message: string): Promise<T[]> {
    let response: Response;
    try {
      response = await this.request(`${this.url}/rest/v1/${path}`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new ApiError(503, 'platform_core_unavailable', message);
    }
    if (!response.ok) throw new ApiError(503, 'platform_core_unavailable', message);
    return (await response.json()) as T[];
  }

  async ready(): Promise<boolean> {
    try {
      const probes = await Promise.all([
        this.rows<PlatformOwnerRow>('platform_owners?select=id,owner_type,status&limit=1', 'Platform owners unavailable'),
        this.rows<MembershipRow>('organization_memberships?select=organization_id,user_id,role,status&limit=1', 'Organization memberships unavailable'),
        this.rows('canonical_assets?select=asset_key,symbol,network_identifier&limit=1', 'Canonical assets unavailable'),
        this.rows('platform_audit_events?select=id,event_type&limit=1', 'Platform audit unavailable'),
      ]);
      return probes.length === 4;
    } catch {
      return false;
    }
  }

  async resolveIndividual(userId: string): Promise<ResolvedPlatformOwner> {
    const row = (await this.rows<PlatformOwnerRow>(
      `platform_owners?owner_type=eq.individual&individual_user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
      'Individual ownership is unavailable',
    ))[0];
    if (!row) throw new ApiError(404, 'platform_owner_not_found', 'Individual financial owner is not provisioned');
    if (row.status !== 'active') throw new ApiError(403, 'platform_owner_inactive', 'Individual financial owner is not active');
    return { platformOwnerId: row.id, owner: { type: 'individual', id: userId } };
  }

  async resolveOrganization(userId: string, organizationId: string): Promise<{ owner: ResolvedPlatformOwner; membership: OrganizationMembership }> {
    const [ownerRow, membershipRow] = await Promise.all([
      this.rows<PlatformOwnerRow>(
        `platform_owners?owner_type=eq.organization&organization_id=eq.${encodeURIComponent(organizationId)}&select=*&limit=1`,
        'Organization ownership is unavailable',
      ),
      this.rows<MembershipRow>(
        `organization_memberships?organization_id=eq.${encodeURIComponent(organizationId)}&user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
        'Organization membership is unavailable',
      ),
    ]);
    const owner = ownerRow[0];
    const membership = membershipRow[0];
    if (!owner || !membership) throw new ApiError(404, 'organization_scope_not_found', 'Organization scope is unavailable');
    if (owner.status !== 'active') throw new ApiError(403, 'platform_owner_inactive', 'Organization financial owner is not active');
    if (membership.status !== 'active') throw new ApiError(403, 'organization_membership_inactive', 'Organization membership is not active');
    return {
      owner: { platformOwnerId: owner.id, owner: { type: 'organization', id: organizationId } },
      membership: {
        organizationId: membership.organization_id,
        userId: membership.user_id,
        role: membership.role,
        status: membership.status,
      },
    };
  }
}
