import { evaluateClerkCutover, type ClerkCutoverDecision } from '../clerk-cutover';

/**
 * Central, fail-closed production auth selection. This is deliberately not
 * connected to route rendering, middleware, or the API bearer boundary yet.
 * No UI may select Clerk solely because a publishable key is present.
 */
export type CustomerAuthMode =
  | { readonly provider: 'supabase'; readonly clerkDecision: ClerkCutoverDecision }
  | { readonly provider: 'clerk'; readonly clerkDecision: { readonly allowed: true } };

export function selectCustomerAuthMode(env: Record<string, string | undefined>): CustomerAuthMode {
  const clerkDecision = evaluateClerkCutover(env);
  if (clerkDecision.allowed) return { provider: 'clerk', clerkDecision };
  return { provider: 'supabase', clerkDecision };
}
