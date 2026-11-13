/**
 * Fail-closed prerequisites for a future Clerk cutover.
 * This does not enable Clerk or change the existing Supabase session provider.
 * Never log environment values or embed credentials in diagnostics.
 */
export type ClerkCutoverDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export function evaluateClerkCutover(env: Record<string, string | undefined>): ClerkCutoverDecision {
  if (env.NEPTLIUM_AUTH_PROVIDER !== 'clerk') {
    return { allowed: false, reason: 'clerk-provider-not-selected' };
  }
  if (env.NEPTLIUM_CLERK_CUTOVER_APPROVED !== 'true') {
    return { allowed: false, reason: 'cutover-not-approved' };
  }
  if (env.NEPTLIUM_IDENTITY_MAPPING_VERIFIED !== 'true') {
    return { allowed: false, reason: 'identity-mapping-not-verified' };
  }
  if (env.NEPTLIUM_AUTH_ROLLBACK_VERIFIED !== 'true') {
    return { allowed: false, reason: 'rollback-not-verified' };
  }
  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_') ||
      !env.CLERK_SECRET_KEY?.startsWith('sk_live_')) {
    return { allowed: false, reason: 'live-clerk-key-pair-not-configured' };
  }
  if (env.NEXT_PUBLIC_SITE_URL !== 'https://app.neptlium.com') {
    return { allowed: false, reason: 'unexpected-production-origin' };
  }
  return { allowed: true };
}
