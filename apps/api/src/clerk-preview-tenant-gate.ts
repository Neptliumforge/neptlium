import { authenticatePreviewClerkPrincipal } from './clerk-preview-principal.js';
import type { ClerkPrincipalStore } from './clerk-principal-gate.js';
import type { ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Preview-only tenant authorization. A verified Clerk subject and durable
 * principal mapping are necessary, but never sufficient for tenant access.
 * This is deliberately not wired into production API routing.
 */
export interface ClerkTenantMembershipStore {
  hasActiveMembership(principalId: string, tenantId: string): Promise<boolean>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function authorizePreviewClerkTenant(
  environment: string | undefined,
  token: string,
  tenantId: string,
  trust: ClerkJwtTrust,
  principals: ClerkPrincipalStore,
  memberships: ClerkTenantMembershipStore,
): Promise<{ readonly principalId: string; readonly tenantId: string } | null> {
  if (environment !== 'preview' || !UUID.test(tenantId)) return null;
  const principal = await authenticatePreviewClerkPrincipal(environment, token, trust, principals);
  if (!principal) return null;
  try {
    if (!await memberships.hasActiveMembership(principal.id, tenantId)) return null;
    return { principalId: principal.id, tenantId };
  } catch {
    // Storage errors must never be interpreted as authorization.
    return null;
  }
}
