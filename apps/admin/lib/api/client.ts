import 'server-only';

import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

function apiOrigin(): string {
  const configured = process.env.NEPTLIUM_API_URL;
  if (!configured) throw new AdminApiError(503, 'api_not_configured', 'The Neptlium API is not configured.');
  const url = new URL(configured);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) {
    throw new AdminApiError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
  }
  return url.origin;
}

async function execute<T>(token: string, path: `/v1/admin${string}`, init: RequestInit = {}): Promise<T> {
  const requestId = randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${apiOrigin()}${path}`, {
      ...init,
      method: (init.method ?? 'GET').toUpperCase(),
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...init.headers,
        authorization: `Bearer ${token}`,
        'x-request-id': requestId,
      },
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as T & {
      error?: { code?: string; message?: string };
      request_id?: string;
    };
    if (!response.ok) {
      throw new AdminApiError(
        response.status,
        payload.error?.code ?? 'api_error',
        payload.error?.message ?? 'The administrative API request failed.',
        payload.request_id ?? response.headers.get('x-request-id') ?? requestId,
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof AdminApiError) throw error;
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    throw new AdminApiError(
      503,
      timedOut ? 'api_timeout' : 'api_unavailable',
      timedOut ? 'The administrative API request timed out.' : 'The administrative API is unavailable.',
      requestId,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function adminApiRequestWithToken<T>(
  token: string,
  path: `/v1/admin${string}`,
  init: RequestInit = {},
): Promise<T> {
  return execute<T>(token, path, init);
}

export async function adminApiRequest<T>(
  path: `/v1/admin${string}`,
  init: RequestInit = {},
): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new AdminApiError(401, 'session_expired', 'Your session has expired.');
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new AdminApiError(401, 'session_expired', 'Your session has expired.');
  return execute<T>(token, path, init);
}
