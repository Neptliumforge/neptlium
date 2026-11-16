/**
 * Clerk API cutover guard.
 *
 * This is a prerequisite check, NOT a JWT verifier. It must never be used to
 * authenticate a request or to derive an authorized principal. Until the API
 * independently verifies Clerk JWTs and resolves an active durable identity
 * mapping, the API must continue rejecting Clerk bearer tokens.
 */
export type ClerkApiReadiness =
  | { readonly ready: false; readonly reason: string }
  | { readonly ready: true };

export function clerkApiReadiness(
  env: Readonly<Record<string, string | undefined>>,
): ClerkApiReadiness {
  if (env.NEPTLIUM_API_AUTH_PROVIDER !== 'clerk-preview') {
    return { ready: false, reason: 'clerk-preview-not-enabled' };
  }
  if (env.VERCEL_ENV !== 'preview') {
    return { ready: false, reason: 'not-preview' };
  }
  if (env.NEPTLIUM_CLERK_API_VERIFIER_TESTED !== 'true') {
    return { ready: false, reason: 'independent-jwt-verifier-not-certified' };
  }
  if (env.NEPTLIUM_CLERK_IDENTITY_RESOLVER_TESTED !== 'true') {
    return { ready: false, reason: 'durable-identity-resolver-not-certified' };
  }
  if (env.NEPTLIUM_CLERK_TENANT_ISOLATION_TESTED !== 'true') {
    return { ready: false, reason: 'tenant-isolation-not-certified' };
  }
  return { ready: true };
}
