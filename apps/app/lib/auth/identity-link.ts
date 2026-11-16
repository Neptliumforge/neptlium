/**
 * Pure authorization boundary for a future Clerk -> existing Neptlium account mapping.
 * Email is deliberately not an identifier: never auto-link accounts by email.
 * This module does not grant sessions or modify Supabase records.
 */
export interface VerifiedIdentityLink {
  readonly clerkSubject: string;
  readonly supabaseUserId: string;
  readonly verified: boolean;
  readonly revoked: boolean;
}

export type IdentityLinkResolution =
  | { readonly status: 'linked'; readonly supabaseUserId: string }
  | { readonly status: 'denied'; readonly reason: 'invalid-subject' | 'missing-link' | 'ambiguous-link' | 'unverified-link' | 'revoked-link' };

const CLERK_SUBJECT = /^user_[a-zA-Z0-9]{8,128}$/;
const SUPABASE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Requires exactly one verified, non-revoked mapping.
 * The caller must fetch links from an independently authorized server-side source.
 */
export function resolveVerifiedIdentityLink(
  clerkSubject: string | null | undefined,
  links: readonly VerifiedIdentityLink[],
): IdentityLinkResolution {
  if (!clerkSubject || !CLERK_SUBJECT.test(clerkSubject)) {
    return { status: 'denied', reason: 'invalid-subject' };
  }
  const matching = links.filter((link) => link.clerkSubject === clerkSubject);
  if (matching.length === 0) return { status: 'denied', reason: 'missing-link' };
  if (matching.length !== 1) return { status: 'denied', reason: 'ambiguous-link' };
  const link = matching[0]!;
  if (link.revoked) return { status: 'denied', reason: 'revoked-link' };
  if (!link.verified || !SUPABASE_UUID.test(link.supabaseUserId)) {
    return { status: 'denied', reason: 'unverified-link' };
  }
  return { status: 'linked', supabaseUserId: link.supabaseUserId };
}
