/**
 * Preview-only identity boundary for the Clerk migration.
 *
 * This module does NOT verify JWTs or provision users. A trusted API must
 * independently verify the Clerk JWT and resolve its subject to an active,
 * durable Neptlium principal and tenant membership before constructing input.
 * Never construct this input from browser claims or user-supplied identifiers.
 */
export interface VerifiedPrincipalResolution {
  readonly verifiedProvider: 'clerk';
  readonly providerSubject: string;
  readonly principalId: string;
  readonly activePrincipal: boolean;
  readonly activeProviderLink: boolean;
  readonly activeMembership: boolean;
  readonly tenantId: string;
  readonly requestedTenantId: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns an API-owned principal ID, never a Clerk subject or email address. */
export function requireVerifiedClerkPrincipal(
  resolution: VerifiedPrincipalResolution | null | undefined,
): string {
  if (
    !resolution ||
    resolution.verifiedProvider !== 'clerk' ||
    !resolution.providerSubject.startsWith('user_') ||
    !UUID.test(resolution.principalId) ||
    !UUID.test(resolution.tenantId) ||
    !UUID.test(resolution.requestedTenantId) ||
    !resolution.activePrincipal ||
    !resolution.activeProviderLink ||
    !resolution.activeMembership ||
    resolution.tenantId.toLowerCase() !== resolution.requestedTenantId.toLowerCase()
  ) {
    throw new Error('clerk_principal_unavailable');
  }
  return resolution.principalId;
}
