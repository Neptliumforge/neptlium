import { ApiError } from './errors.js';
import type { Config } from './config.js';
import type { IdentityPrincipalResolver } from './identity-principal.js';

export type AuthenticatedPrincipal = {
  id: string;
  provider: 'SUPABASE_AUTH';
  providerSubject: string;
};

type Fetch = typeof fetch;
type SupabaseVerifier = (token: string, config: Config, request?: Fetch) => Promise<string | null>;

export async function verifySupabaseSubject(
  token: string,
  config: Config,
  request: Fetch = fetch,
): Promise<string | null> {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;

  let response: Response;
  try {
    response = await request(`${config.SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: config.SUPABASE_ANON_KEY,
        authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new ApiError(503, 'authentication_unavailable', 'Supabase authentication is unavailable');
  }

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok)
    throw new ApiError(503, 'authentication_unavailable', 'Supabase authentication is unavailable');

  const payload = (await response.json().catch(() => null)) as { id?: unknown } | null;
  return typeof payload?.id === 'string' && payload.id ? payload.id : null;
}

export function createPrincipalAuthenticator(
  config: Config,
  resolver: IdentityPrincipalResolver | undefined,
  request: Fetch = fetch,
  verifier: SupabaseVerifier = verifySupabaseSubject,
) {
  return async (token: string): Promise<AuthenticatedPrincipal | null> => {
    const subject = await verifier(token, config, request);
    if (!subject) return null;
    if (!resolver)
      throw new ApiError(503, 'identity_storage_unavailable', 'Identity mapping is unavailable');

    const resolved = await resolver.resolveActivePrincipal('SUPABASE_AUTH', subject);
    if (!resolved) return null;
    return {
      id: resolved.principal.id,
      provider: 'SUPABASE_AUTH',
      providerSubject: subject,
    };
  };
}
