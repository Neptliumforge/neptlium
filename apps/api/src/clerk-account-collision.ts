/**
 * Existing-account collision guard for Clerk Preview provisioning.
 * A matching verified email is NOT proof of ownership of an existing principal.
 * The caller must obtain the email from a trusted, verified provider API,
 * never from browser input or unsigned JWT claims. This module never writes.
 */
export interface ClerkAccountCollisionStore {
  findProfilesByNormalizedEmail(email: string): Promise<readonly { id: string }[]>;
}
export type ClerkAccountCollisionDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: 'not-preview' | 'invalid-email' | 'existing-account-link-required' | 'storage-unavailable' };

export async function checkClerkNewAccountCollision(
  environment: string | undefined,
  verifiedPrimaryEmail: string,
  store: ClerkAccountCollisionStore,
): Promise<ClerkAccountCollisionDecision> {
  if (environment !== 'preview') return { allowed: false, reason: 'not-preview' };
  if (typeof verifiedPrimaryEmail !== 'string') return { allowed: false, reason: 'invalid-email' };
  const email = verifiedPrimaryEmail.trim().toLowerCase();
  if (email.length < 3 || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { allowed: false, reason: 'invalid-email' };
  try {
    const matches = await store.findProfilesByNormalizedEmail(email);
    if (!Array.isArray(matches)) return { allowed: false, reason: 'storage-unavailable' };
    // Never return the existing account ID to an unlinked Clerk subject.
    if (matches.length !== 0) return { allowed: false, reason: 'existing-account-link-required' };
    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'storage-unavailable' };
  }
}
