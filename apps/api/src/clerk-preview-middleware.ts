import { authenticateClerkPreviewTenant, type ClerkPreviewIdentityStore } from './clerk-preview-identity.js';
import type { ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Isolated read-only Preview API authentication boundary.
 * Do not register this middleware on production routes or payment handlers.
 * A caller-supplied organization is a lookup target, never an authorization grant.
 */
export async function authorizeClerkPreviewRequest(
  headers: Readonly<Record<string, string | undefined>>,
  organizationId: string,
  trust: ClerkJwtTrust,
  store: ClerkPreviewIdentityStore,
  environment: string | undefined,
): Promise<{ principalId: string; organizationId: string } | null> {
  if (environment !== 'preview') return null;
  const authorization = headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization)) return null;
  return authenticateClerkPreviewTenant(authorization.slice(7), organizationId, trust, store, environment);
}
