import { authenticateClerkBearer } from './clerk-bearer-adapter.js';
import type { ClerkPrincipalStore } from './clerk-principal-gate.js';
import type { ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Separate, Preview-only identity boundary. Do not impersonate a Supabase Auth
 * principal by casting its provider. Existing production API routes are unchanged.
 */
export type PreviewClerkPrincipal = {
  readonly id: string;
  readonly provider: 'CLERK';
};

export async function authenticatePreviewClerkPrincipal(
  environment: string | undefined,
  token: string,
  trust: ClerkJwtTrust,
  store: ClerkPrincipalStore,
): Promise<PreviewClerkPrincipal | null> {
  if (environment !== 'preview') return null;
  const result = await authenticateClerkBearer('Bearer ' + token, trust, store);
  return result.authorized ? { id: result.principalId, provider: 'CLERK' } : null;
}
