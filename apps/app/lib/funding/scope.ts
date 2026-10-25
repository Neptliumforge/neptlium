import 'server-only';
import { createHash } from 'node:crypto';
import { getCurrentProfile, getSessionUser } from '@/lib/auth/session';
import { isOperationScope } from './operation';

// An opaque partition for one authenticated principal's stored funding
// operations. It keeps browser-held operation keys and intent IDs from being
// reused across accounts in the same tab. It is derived only from the
// API-verified internal principal, and it is never authorization: the API still
// derives the owner from the authenticated request and scopes every intent to
// that owner.
export function fundingOperationScope(principalId: string): string {
  return createHash('sha256')
    .update(`neptlium.funding-operation-scope.v1:${principalId}`)
    .digest('hex');
}

export type OperationScopeCheck = 'MATCH' | 'MISMATCH' | 'NO_SESSION' | 'UNVERIFIED';

// Confirms the operation was recorded for the principal of the current
// session before anything is submitted or read under it.
export async function checkFundingOperationScope(scope: unknown): Promise<OperationScopeCheck> {
  if (!isOperationScope(scope)) return 'MISMATCH';
  let user: Awaited<ReturnType<typeof getSessionUser>>;
  try {
    user = await getSessionUser();
  } catch {
    return 'UNVERIFIED';
  }
  if (!user) return 'NO_SESSION';
  // Resolve the API-owned principal before accepting any browser operation.
  // A valid auth session alone is not sufficient to authorize funding replay.
  let profile: Awaited<ReturnType<typeof getCurrentProfile>>;
  try {
    profile = await getCurrentProfile(user);
  } catch {
    return 'UNVERIFIED';
  }
  if (!profile?.id) return 'UNVERIFIED';
  return fundingOperationScope(profile.id) === scope ? 'MATCH' : 'MISMATCH';
}
