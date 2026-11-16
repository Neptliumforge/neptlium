import { verifyClerkJwtRs256, type ClerkJwtTrust } from './clerk-jwt-verifier.js';

/** A verified Clerk identity is not an authorized Neptlium account. */
export interface ClerkPrincipalStore {
  resolveActiveClerkPrincipal(subject: string): Promise<string | null>;
}

export type ClerkPrincipalDecision =
  | { readonly authorized: true; readonly principalId: string }
  | { readonly authorized: false; readonly reason: 'invalid-token' | 'unlinked-identity' | 'identity-unavailable' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Server-only identity gate, independent of tenant/financial authorization.
 * Does not create accounts, accept client-supplied principal IDs, or authorize by email.
 * Trust must come from server configuration with a separately verified key-rotation policy.
 * Deliberately not installed in production routing until cutover gates pass.
 */
export async function resolveVerifiedClerkPrincipal(
  token: string,
  trust: ClerkJwtTrust,
  store: ClerkPrincipalStore,
): Promise<ClerkPrincipalDecision> {
  const verified = verifyClerkJwtRs256(token, trust);
  if (!verified.valid) return { authorized: false, reason: 'invalid-token' };
  try {
    const principalId = await store.resolveActiveClerkPrincipal(verified.subject);
    if (!principalId || !UUID.test(principalId)) {
      return { authorized: false, reason: 'unlinked-identity' };
    }
    return { authorized: true, principalId };
  } catch {
    // Never leak storage errors or turn storage failures into anonymous access.
    return { authorized: false, reason: 'identity-unavailable' };
  }
}
