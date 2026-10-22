import { createClerkClient, verifyToken } from '@clerk/backend';
import { ApiError } from './errors.js';
import type { Config } from './config.js';
import type { IdentityPrincipalResolver } from './identity-principal.js';
export interface ClerkIdentity {
  subject: string;
  verifiedEmail: string;
}
type Backend = Pick<ReturnType<typeof createClerkClient>, 'users' | 'sessions'>;
export function createClerkIdentityVerifier(
  config: Config,
  backend: Backend = createClerkClient({ secretKey: config.CLERK_SECRET_KEY ?? '' }),
  verify: typeof verifyToken = verifyToken,
) {
  return async (token: string): Promise<ClerkIdentity | null> => {
    if (config.AUTH_MODE !== 'CLERK_DEVELOPMENT') return null;
    let claims;
    try {
      claims = await verify(token, {
        jwtKey: config.CLERK_JWT_KEY,
        issuer: config.CLERK_ISSUER,
        authorizedParties: config.CLERK_AUTHORIZED_PARTIES,
        clockSkewInMs: 0,
      });
    } catch {
      return null;
    }
    if (
      claims.iss !== config.CLERK_ISSUER ||
      typeof claims.azp !== 'string' ||
      !config.CLERK_AUTHORIZED_PARTIES.includes(claims.azp) ||
      typeof claims.sub !== 'string' ||
      !claims.sub.startsWith('user_') ||
      typeof claims.sid !== 'string' ||
      !claims.sid.startsWith('sess_')
    )
      return null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const [session, user] = await Promise.race([
        Promise.all([backend.sessions.getSession(claims.sid), backend.users.getUser(claims.sub)]),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), 8000);
        }),
      ]);
      if (
        session.id !== claims.sid ||
        session.userId !== claims.sub ||
        session.status !== 'active' ||
        user.id !== claims.sub ||
        user.banned ||
        user.locked
      )
        return null;
      const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
      if (!primary || primary.verification?.status !== 'verified' || !primary.emailAddress)
        return null;
      return { subject: claims.sub, verifiedEmail: primary.emailAddress };
    } catch {
      throw new ApiError(503, 'authentication_unavailable', 'Identity verification is unavailable');
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}
export function createClerkPrincipalAuthenticator(
  verify: (token: string) => Promise<ClerkIdentity | null>,
  resolver: IdentityPrincipalResolver | undefined,
) {
  return async (token: string) => {
    const identity = await verify(token);
    if (!identity) return null;
    if (!resolver)
      throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');
    const resolved = await resolver.resolveActivePrincipal('CLERK', identity.subject);
    if (!resolved) return null;
    return {
      id: resolved.principal.id,
      provider: 'CLERK' as const,
      providerSubject: identity.subject,
    };
  };
}
export async function bootstrapClerkIdentity(
  config: Config,
  identity: ClerkIdentity,
  requestId: string,
  request = fetch,
) {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY)
    throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');
  let response: Response;
  try {
    response = await request(
      config.SUPABASE_URL + '/rest/v1/rpc/bootstrap_development_clerk_identity',
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + config.SUPABASE_SERVICE_ROLE_KEY,
          apikey: config.SUPABASE_SERVICE_ROLE_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          p_subject: identity.subject,
          p_email: identity.verifiedEmail,
          p_request_id: requestId,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
  } catch {
    throw new ApiError(503, 'identity_bootstrap_unavailable', 'Account setup is unavailable');
  }
  if (response.status === 409 || response.status === 400)
    throw new ApiError(
      409,
      'identity_link_unavailable',
      'Account setup needs a reviewed identity link',
    );
  if (!response.ok)
    throw new ApiError(503, 'identity_bootstrap_unavailable', 'Account setup is unavailable');
  const data = (await response.json()) as { profile_id?: unknown };
  if (
    typeof data.profile_id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.profile_id)
  )
    throw new ApiError(503, 'identity_bootstrap_unavailable', 'Account setup is unavailable');
  return { profile_id: data.profile_id };
}

export async function completeDevelopmentOnboarding(
  config: Config,
  principal: string,
  payload: unknown,
  request = fetch,
) {
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY)
    throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');
  const response = await request(
    config.SUPABASE_URL + '/rest/v1/rpc/complete_development_clerk_onboarding',
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + config.SUPABASE_SERVICE_ROLE_KEY,
        apikey: config.SUPABASE_SERVICE_ROLE_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_principal: principal, p_payload: payload }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (response.status === 409)
    throw new ApiError(403, 'forbidden', 'Account setup cannot change this account');
  if (!response.ok) throw new ApiError(503, 'data_unavailable', 'Account setup is unavailable');
  const data = (await response.json()) as { profile_id?: unknown };
  if (data.profile_id !== principal)
    throw new ApiError(503, 'data_unavailable', 'Account setup is unavailable');
  return { profileId: principal };
}
