import 'server-only';

import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';

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

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiClientError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
  }

  const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (isLocal) {
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ApiClientError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
    }
  } else if (url.protocol !== 'https:') {
    throw new ApiClientError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
  }

  if (process.env.NODE_ENV === 'production' && url.hostname !== 'api.neptlium.com') {
    throw new ApiClientError(503, 'invalid_api_origin', 'The Neptlium API origin is invalid.');
  }

  return url.origin;
}

export async function apiRequest<T>(path: `/v1/${string}`, init: RequestInit = {}): Promise<T> {
  const session = await auth();
  if (!session.userId) throw new ApiClientError(401, 'session_expired', 'Your session has expired.');
  const token = await session.getToken();
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

export function bootstrapClerkAccount(): Promise<{
  status: 'created' | 'existing';
  profile_id: string;
}> {
  return apiRequest('/v1/auth/bootstrap', { method: 'POST' });
}

export type ResourceState<T = never> =
  | { readonly state: 'VALUE'; readonly value: T }
  | { readonly state: 'EMPTY' }
  | { readonly state: 'NOT_CONFIGURED'; readonly reason: string }
  | { readonly state: 'UNAVAILABLE'; readonly reason: string };

export interface AccountContext {
  readonly profileId: string;
  readonly accountId: string | null;
  readonly provisionedAt: string | null;
  readonly onboardingStatus: 'not_started' | 'in_progress' | 'complete';
}

export function getAccountContext(): Promise<AccountContext> {
  return apiRequest('/v1/account-context');
}

export function getPortfolioSummary(): Promise<ResourceState<Record<string, unknown>>> {
  return apiRequest('/v1/portfolio/summary');
}

export function getPortfolioAssets(): Promise<ResourceState<readonly Record<string, unknown>[]>> {
  return apiRequest('/v1/portfolio/assets');
}

export function getPortfolioActivity(): Promise<ResourceState<readonly Record<string, unknown>[]>> {
  return apiRequest('/v1/portfolio/activity');
}

export function getAllocationPolicy(): Promise<ResourceState<Record<string, unknown>>> {
  return apiRequest('/v1/allocation/policy');
}

export function getAllocationPreview(): Promise<ResourceState<Record<string, unknown>>> {
  return apiRequest('/v1/allocation/preview');
}

export function getTreasurySummary(): Promise<ResourceState<Record<string, unknown>>> {
  return apiRequest('/v1/treasury/summary');
}

export function getTreasuryAccounts(): Promise<ResourceState<readonly Record<string, unknown>[]>> {
  return apiRequest('/v1/treasury/accounts');
}

export function getIntelligenceSummary(): Promise<ResourceState<Record<string, unknown>>> {
  return apiRequest('/v1/intelligence/summary');
}

export function getIntelligenceActivity(): Promise<ResourceState<readonly Record<string, unknown>[]>> {
  return apiRequest('/v1/intelligence/activity');
}
