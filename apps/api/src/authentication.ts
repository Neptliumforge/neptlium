import { createClerkClient, verifyToken } from '@clerk/backend';
import { ApiError } from './errors.js';
import type { Config } from './config.js';
import type { IdentityPrincipalResolver } from './identity-principal.js';

export type AuthenticatedPrincipal = {
  id: string;
  provider: 'CLERK';
  providerSubject: string;
};

export type VerifiedClerkIdentity = {
  subject: string;
  primaryEmail: string;
};

type Fetch = typeof fetch;
type ClerkVerifier = (token: string, config: Config) => Promise<string | null>;

export async function verifyClerkSubject(token: string, config: Config): Promise<string | null> {
  if (!config.CLERK_SECRET_KEY) return null;
  try {
    const payload = await verifyToken(token, {
      secretKey: config.CLERK_SECRET_KEY,
      jwtKey: config.CLERK_JWT_KEY,
      authorizedParties: config.CLERK_AUTHORIZED_PARTIES,
    });
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function verifyClerkIdentity(
  token: string,
  config: Config,
): Promise<VerifiedClerkIdentity | null> {
  const subject = await verifyClerkSubject(token, config);
  if (!subject || !config.CLERK_SECRET_KEY) return null;
  try {
    const user = await createClerkClient({ secretKey: config.CLERK_SECRET_KEY }).users.getUser(subject);
    const primary = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId && email.verification?.status === 'verified',
    );
    if (!primary?.emailAddress) return null;
    return { subject, primaryEmail: primary.emailAddress.trim().toLowerCase() };
  } catch {
    throw new ApiError(503, 'authentication_unavailable', 'Clerk authentication is unavailable');
  }
}

export function createPrincipalAuthenticator(
  config: Config,
  resolver: IdentityPrincipalResolver | undefined,
  _request: Fetch = fetch,
  clerkVerifier: ClerkVerifier = verifyClerkSubject,
) {
  return async (token: string): Promise<AuthenticatedPrincipal | null> => {
    const subject = await clerkVerifier(token, config);
    if (!subject) return null;
    if (!resolver)
      throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');

    const resolved = await resolver.resolveActivePrincipal('CLERK', subject);
    if (!resolved) return null;
    return {
      id: resolved.principal.id,
      provider: 'CLERK',
      providerSubject: subject,
    };
  };
}
