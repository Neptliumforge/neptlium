import 'server-only';

import { apiRequest } from './client';

export type ClerkBootstrapStatus =
  | { status: 'created'; profile_id: string }
  | { status: 'existing'; profile_id: string }
  | { status: 'link_required'; profile_id: string };

export function bootstrapClerkIdentity(): Promise<ClerkBootstrapStatus> {
  return apiRequest<ClerkBootstrapStatus>('/v1/auth/bootstrap', { method: 'POST' });
}
