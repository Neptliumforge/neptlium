import { verifyToken } from '@clerk/backend';
import { ApiError } from './errors.js';
import type { Config } from './config.js';
import type { IdentityPrincipalResolver, IdentityProvider } from './identity-principal.js';

export type AuthenticatedPrincipal = {
  id: string;
  provider: IdentityProvider;
  providerSubject: string;
};

type Fetch = typeof fetch;
type ClerkVerifier = (token: string, config: Config) => Promise<string | null>;

async function verifySupabaseSubject(
  token: string,
  config: Config,
  request: Fetch,
): Promise<string | null> {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
  let response: Response;
  try {
    response = await request(`${config.SUPABASE_URL}/auth/v1/user`, {
      headers: { authorization: `Bearer ${token}`, apikey: config.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new ApiError(503, 'authentication_unavailable', 'Authentication service is unavailable');
  }
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string };
  return user.id ?? null;
}

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

export function createPrincipalAuthenticator(
  config: Config,
  resolver: IdentityPrincipalResolver | undefined,
  request: Fetch = fetch,
  clerkVerifier: ClerkVerifier = verifyClerkSubject,
) {
  return async (token: string): Promise<AuthenticatedPrincipal | null> => {
    const providers: IdentityProvider[] =
      config.AUTH_MODE === 'CLERK'
        ? ['CLERK']
        : config.AUTH_MODE === 'DUAL'
          ? ['CLERK', 'SUPABASE_AUTH']
          : ['SUPABASE_AUTH'];

    for (const provider of providers) {
      const subject =
        provider === 'CLERK'
          ? await clerkVerifier(token, config)
          : await verifySupabaseSubject(token, config, request);
      if (!subject) continue;

      // Compatibility is intentionally limited to the pre-cutover Supabase mode.
      if (!resolver) {
        if (config.AUTH_MODE === 'SUPABASE' && provider === 'SUPABASE_AUTH')
          return { id: subject, provider, providerSubject: subject };
        throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');
      }
      const resolved = await resolver.resolveActivePrincipal(provider, subject);
      if (!resolved) return null;
      return {
        id: resolved.principal.id,
        provider,
        providerSubject: subject,
      };
    }
    return null;
  };
}
