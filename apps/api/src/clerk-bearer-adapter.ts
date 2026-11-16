import { resolveVerifiedClerkPrincipal, type ClerkPrincipalDecision, type ClerkPrincipalStore } from './clerk-principal-gate.js';
import type { ClerkJwtTrust } from './clerk-jwt-verifier.js';

/**
 * Isolated server-side bearer adapter for the future Clerk API authentication path.
 * This adapter is not installed in production routing and never grants tenant or financial rights.
 * Only the exact Authorization: Bearer <JWT> format is accepted.
 */
export async function authenticateClerkBearer(
  authorization: string | undefined,
  trust: ClerkJwtTrust,
  store: ClerkPrincipalStore,
): Promise<ClerkPrincipalDecision> {
  if (typeof authorization !== 'string' ||
      !/^Bearer [A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$/.test(authorization)) {
    return { authorized: false, reason: 'invalid-token' };
  }
  return resolveVerifiedClerkPrincipal(authorization.slice(7), trust, store);
}
