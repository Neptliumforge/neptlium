import 'server-only';

import { randomUUID } from 'node:crypto';
import { createSupabaseServerClient } from '@neptlium/lib/supabase/server';

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function apiOrigin(): string {
  const configured = process.env.NEPTLIUM_API_URL;
  if (!configured)
    throw new ApiClientError(503, 'api_not_configured', 'The Neptlium API is not configured.');
  const url = new URL(configured);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
  ) {
    throw new ApiClientError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
  }
  return url.origin;
}

export async function apiRequest<T>(path: `/v1/${string}`, init: RequestInit = {}): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user)
    throw new ApiClientError(401, 'session_expired', 'Your session has expired.');
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new ApiClientError(401, 'session_expired', 'Your session has expired.');

  const method = (init.method ?? 'GET').toUpperCase();
  const requestId = randomUUID();
  const attempts = method === 'GET' ? 2 : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(`${apiOrigin()}${path}`, {
        ...init,
        method,
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
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
        request_id?: string;
      } & T;
      if (!response.ok) {
        throw new ApiClientError(
          response.status,
          payload.error?.code ?? 'api_error',
          payload.error?.message ?? 'The API request failed.',
          payload.request_id ?? response.headers.get('x-request-id') ?? requestId,
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (attempt + 1 === attempts) {
        const timedOut = error instanceof DOMException && error.name === 'AbortError';
        throw new ApiClientError(
          503,
          timedOut ? 'api_timeout' : 'api_unavailable',
          timedOut ? 'The API request timed out.' : 'The API is unavailable.',
          requestId,
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new ApiClientError(503, 'api_unavailable', 'The API is unavailable.', requestId);
}

export type ProvisioningStatus = { status: 'provisioned'; profile_id: string };

export function ensureAccountProvisioned(): Promise<ProvisioningStatus> {
  return apiRequest<ProvisioningStatus>('/v1/account/provision', { method: 'POST' });
}

export type OnboardingCompletionStatus = { status: 'completed'; profile_id: string };

export function completeAccountOnboarding(input: unknown): Promise<OnboardingCompletionStatus> {
  return apiRequest<OnboardingCompletionStatus>('/v1/account/onboarding', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
