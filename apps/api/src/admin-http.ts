import { randomUUID } from 'node:crypto';
import type { Config } from './config.js';
import { ApiError } from './errors.js';
import { DisabledAdminRepository, SupabaseAdminRepository, type AdminRepository } from './admin-repository.js';
import { handleAdminRoute } from './admin-routes.js';

export interface AdminHttpInput {
  method: string;
  url: string;
  headers: Record<string, string>;
  payload?: string;
  clientAddress: string;
}
export interface AdminHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}
const repositories = new WeakMap<Config, AdminRepository>();

function repositoryFor(config: Config): AdminRepository {
  const existing = repositories.get(config);
  if (existing) return existing;
  const repository = config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
    ? new SupabaseAdminRepository(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    : new DisabledAdminRepository();
  repositories.set(config, repository);
  return repository;
}

async function authenticate(config: Config, token: string): Promise<{ id: string } | null> {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
  let response: Response;
  try {
    response = await fetch(`${config.SUPABASE_URL}/auth/v1/user`, {
      headers: { authorization: `Bearer ${token}`, apikey: config.SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new ApiError(503, 'authentication_unavailable', 'Authentication service is unavailable');
  }
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string };
  return user.id ? { id: user.id } : null;
}

export async function executeAdminHttp(
  config: Config,
  input: AdminHttpInput,
  injected?: { repository?: AdminRepository; authenticate?: (token: string) => Promise<{ id: string } | null> },
): Promise<AdminHttpResponse> {
  const target = new URL(input.url, 'http://localhost');
  const headers = Object.fromEntries(Object.entries(input.headers).map(([key, value]) => [key.toLowerCase(), value]));
  const requestId =
    headers['x-request-id'] && /^[A-Za-z0-9._:-]{1,128}$/.test(headers['x-request-id'])
      ? headers['x-request-id']
      : randomUUID();
  const responseHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'x-request-id': requestId,
  };

  try {
    if (!target.pathname.startsWith('/v1/admin'))
      throw new ApiError(404, 'not_found', 'Route not found');
    const authorization = headers.authorization;
    if (!authorization?.startsWith('Bearer '))
      throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');
    const principal = await (injected?.authenticate ?? ((token: string) => authenticate(config, token)))(authorization.slice(7));
    if (!principal)
      throw new ApiError(401, 'authentication_required', 'A valid bearer token is required');

    let body: unknown;
    try {
      body = input.payload ? JSON.parse(input.payload) : undefined;
    } catch {
      throw new ApiError(422, 'validation_failed', 'Malformed JSON');
    }

    const result = await handleAdminRoute(
      {
        method: input.method.toUpperCase(),
        path: target.pathname,
        query: target.searchParams,
        headers,
        body,
        requestId,
        clientAddress: input.clientAddress,
      },
      { repository: injected?.repository ?? repositoryFor(config), principal },
    );
    return { statusCode: result.status ?? 200, headers: responseHeaders, body: JSON.stringify(result.data) };
  } catch (error) {
    const safe = error instanceof ApiError ? error : new ApiError(500, 'internal_error', 'An unexpected error occurred');
    return {
      statusCode: safe.status,
      headers: responseHeaders,
      body: JSON.stringify({
        error: { code: safe.code, message: safe.message, ...(safe.details === undefined ? {} : { details: safe.details }) },
        request_id: requestId,
      }),
    };
  }
}
