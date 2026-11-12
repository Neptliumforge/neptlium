import type { SessionProfile, SessionUser } from './session';
import { getCurrentProfile } from './session';

/** Authentication is separate from the API-owned account provisioning state. */
export type AccountResolution =
  | { readonly state: 'PROVISIONED'; readonly profile: SessionProfile & { readonly id: string } }
  | { readonly state: 'NOT_PROVISIONED'; readonly profile: SessionProfile | null }
  | { readonly state: 'UNVERIFIED'; readonly profile: null };

export async function resolveAccountState(user: SessionUser): Promise<AccountResolution> {
  try {
    const profile = await getCurrentProfile(user);
    if (!profile) return { state: 'NOT_PROVISIONED', profile: null };
    if (!profile.id) return { state: 'UNVERIFIED', profile: null };
    if (!profile.provisionedAt) return { state: 'NOT_PROVISIONED', profile };
    return { state: 'PROVISIONED', profile: { ...profile, id: profile.id } };
  } catch {
    // Never interpret an API outage as an unprovisioned customer.
    return { state: 'UNVERIFIED', profile: null };
  }
}
