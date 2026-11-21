import 'server-only';

import { requireVerifiedClerkPrincipal, type VerifiedPrincipalResolution } from './clerk-principal-gate.ts';

/**
 * Server-only Preview adapter for a future Clerk -> Neptlium API session.
 * This does not alter the production Supabase bearer path.
 *
 * Both callbacks must be implemented on a trusted server: token issuance
 * by Clerk's authenticated server session, and principal resolution by
 * Neptlium's independently verified API identity boundary. Never populate
 * resolution from browser state, email, or unverified JWT claims.
 */
export interface PreviewClerkSessionDependencies {
  readonly environment: string | undefined;
  readonly apiProvider: string | undefined;
  readonly getSessionToken: () => Promise<string | null>;
  readonly resolveVerifiedPrincipal: (token: string, tenantId: string) => Promise<VerifiedPrincipalResolution | null>;
}

const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolvePreviewClerkApiSession(
  tenantId: string,
  deps: PreviewClerkSessionDependencies,
): Promise<{ readonly bearerToken: string; readonly principalId: string } | null> {
  if (deps.environment !== 'preview' || deps.apiProvider !== 'clerk-preview' || !UUID.test(tenantId)) {
    return null;
  }
  try {
    const token = await deps.getSessionToken();
    if (!token || token.length > 16384 || !JWT.test(token)) return null;

    // The API verifies the JWT signature, issuer, audience, azp and expiry
    // before returning a durable principal and active membership decision.
    const resolution = await deps.resolveVerifiedPrincipal(token, tenantId);
    if (!resolution || resolution.requestedTenantId.toLowerCase() !== tenantId.toLowerCase()) return null;
    const principalId = requireVerifiedClerkPrincipal(resolution);
    return { bearerToken: token, principalId };
  } catch {
    return null;
  }
}
