import { evaluateClerkCutover, type ClerkCutoverDecision } from '../clerk-cutover.ts';

/**
 * Production authentication selection must never silently fall back to
 * Supabase Auth after Clerk has been selected: doing so would create a
 * split-brain session authority during a failed or partial cutover.
 * This selector is not yet wired into routes or API authentication.
 */
export type CustomerAuthMode =
  | { readonly provider: 'supabase'; readonly clerkDecision: ClerkCutoverDecision }
  | { readonly provider: 'clerk'; readonly clerkDecision: { readonly allowed: true } }
  | { readonly provider: 'blocked'; readonly clerkDecision: { readonly allowed: false; readonly reason: string } };

export function selectCustomerAuthMode(env: Record<string, string | undefined>): CustomerAuthMode {
  const clerkDecision = evaluateClerkCutover(env);
  if (clerkDecision.allowed) return { provider: 'clerk', clerkDecision };
  if (env.NEPTLIUM_AUTH_PROVIDER === 'clerk') {
    return { provider: 'blocked', clerkDecision };
  }
  return { provider: 'supabase', clerkDecision };
}
