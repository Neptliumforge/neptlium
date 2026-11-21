import { authenticateClerkPreviewTenant, type ClerkPreviewIdentityStore } from './clerk-preview-identity.js';
import { createClerkSigningKeyLoader } from './clerk-jwks.js';
import type { ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Isolated read-only Preview API authentication boundary.
 * Do not register this middleware on production routes or payment handlers.
 * A caller-supplied organization is a lookup target, never an authorization grant.
 */
export async function authorizeClerkPreviewRequest(
  headers: Readonly<Record<string, string | undefined>>,
  organizationId: string,
  trust: ClerkJwtTrust | (() => Promise<ClerkJwtTrust>),
  store: ClerkPreviewIdentityStore,
  environment: string | undefined,
): Promise<{ principalId: string; organizationId: string } | null> {
  if (environment !== 'preview') return null;
  const authorization = headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization)) return null;
  if (authorization.length > 16391) return null;
  const resolvedTrust = typeof trust === 'function' ? await trust().catch(() => null) : trust;
  if (!resolvedTrust) return null;
  return authenticateClerkPreviewTenant(authorization.slice(7), organizationId, resolvedTrust, store, environment);
}

/** Create once per Preview API instance to retain the issuer's short-lived key cache. */
export function createClerkPreviewAuthorizer(
  trust: Omit<ClerkJwtTrust, 'keys'>,
  store: ClerkPreviewIdentityStore,
  request: typeof fetch = fetch,
) {
  const loadKeys = createClerkSigningKeyLoader(trust.issuer, request);
  const loadTrust = async () => ({ ...trust, keys: await loadKeys() });
  return (
    headers: Readonly<Record<string, string | undefined>>,
    organizationId: string,
    environment: string | undefined,
  ) => authorizeClerkPreviewRequest(headers, organizationId, loadTrust, store, environment);
}
