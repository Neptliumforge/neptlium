import type { AuthenticatedPrincipal } from './authentication.js';
import { canActForOrganization } from './platform-core-domain.js';
import type { PlatformCoreRepository } from './platform-core-repository.js';

export type PlatformContext =
  | {
      readonly ownerType: 'individual';
      readonly ownerId: string;
      readonly platformOwnerId: string;
      readonly actorPrincipalId: string;
      readonly permissions: { readonly read: true; readonly operate: true; readonly approve: true; readonly administer: true };
    }
  | {
      readonly ownerType: 'organization';
      readonly ownerId: string;
      readonly platformOwnerId: string;
      readonly actorPrincipalId: string;
      readonly role: 'owner' | 'admin' | 'approver' | 'operator' | 'viewer' | 'auditor';
      readonly permissions: { readonly read: boolean; readonly operate: boolean; readonly approve: boolean; readonly administer: boolean };
    };

export async function resolvePlatformContext(
  principal: AuthenticatedPrincipal,
  repository: PlatformCoreRepository,
  organizationId?: string,
): Promise<PlatformContext> {
  // providerSubject is the authoritative Supabase Auth user UUID. principal.id is
  // Neptlium's internal identity-principal UUID and must never substitute for it.
  const authUserId = principal.providerSubject;

  if (!organizationId) {
    const resolved = await repository.resolveIndividual(authUserId);
    return {
      ownerType: 'individual',
      ownerId: resolved.owner.id,
      platformOwnerId: resolved.platformOwnerId,
      actorPrincipalId: principal.id,
      permissions: { read: true, operate: true, approve: true, administer: true },
    };
  }

  const resolved = await repository.resolveOrganization(authUserId, organizationId);
  const role = resolved.membership.role;
  return {
    ownerType: 'organization',
    ownerId: resolved.owner.owner.id,
    platformOwnerId: resolved.owner.platformOwnerId,
    actorPrincipalId: principal.id,
    role,
    permissions: {
      read: canActForOrganization(role, 'read'),
      operate: canActForOrganization(role, 'operate'),
      approve: canActForOrganization(role, 'approve'),
      administer: canActForOrganization(role, 'administer'),
    },
  };
}
