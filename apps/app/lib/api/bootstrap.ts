import 'server-only';

import { apiRequest } from './client';

export type ClerkBootstrapStatus =
  | { status: 'created'; profile_id: string }
  | { status: 'existing'; profile_id: string }
  | { status: 'link_required'; profile_id: string };

/**
 * Clerk is the only authentication provider. `link_required` is retained only
 * as a temporary compatibility response from a database migration that may not
 * yet have been applied; callers must never open a legacy authentication flow.
 */
export function bootstrapClerkIdentity(): Promise<ClerkBootstrapStatus> {
  return apiRequest<ClerkBootstrapStatus>('/v1/auth/bootstrap', { method: 'POST' });
}
