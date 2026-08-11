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

export type ResourceState<T = never> =
  | { readonly state: 'VALUE'; readonly value: T }
  | { readonly state: 'EMPTY' }
  | { readonly state: 'NOT_CONFIGURED'; readonly reason: string }
  | { readonly state: 'UNAVAILABLE'; readonly reason: string }
  | { readonly state: 'PENDING'; readonly reason: string };

export interface AccountContext {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
  readonly displayName: string | null;
  readonly investorType: string | null;
  readonly organizationId: string | null;
  readonly complianceStatus: string | null;
  readonly provisionedAt: string | null;
  readonly role: string;
}

export interface CustomerActivity {
  readonly id: string;
  readonly type: string;
  readonly asset: string;
  readonly network: string;
  readonly amount: string;
  readonly status: string;
  readonly reference: string | null;
  readonly counterparty: string | null;
  readonly createdAt: string;
}

export interface CapitalActivityPage {
  readonly state: 'VALUE' | 'EMPTY';
  readonly data: readonly CustomerActivity[];
  readonly total: number;
  readonly assets: readonly string[];
  readonly networks: readonly string[];
  readonly next_offset: number | null;
}

export interface OverviewState {
  readonly capital: {
    readonly total: ResourceState;
    readonly available: ResourceState;
    readonly reserved: ResourceState;
    readonly allocated: ResourceState;
  };
  readonly portfolio: ResourceState;
  readonly treasury: ResourceState;
  readonly allocation: ResourceState;
  readonly activity: ResourceState<readonly CustomerActivity[]>;
}

export interface PortfolioState {
  readonly value: ResourceState;
  readonly positions: ResourceState;
  readonly performance: ResourceState;
}

export interface TreasuryState {
  readonly available_liquidity: ResourceState;
  readonly reserved: ResourceState;
  readonly committed: ResourceState;
  readonly funding: ResourceState;
  readonly transfers: ResourceState;
}

export interface AllocationState {
  readonly observed: ResourceState;
  readonly modeled: ResourceState;
  readonly authorized: ResourceState;
  readonly executed: ResourceState;
  readonly reconciled: ResourceState;
}

export interface CapitalAccountState {
  readonly canonical: {
    readonly total: ResourceState;
    readonly available: ResourceState;
    readonly reserved: ResourceState;
    readonly pending: ResourceState;
  };
  readonly provider_observation: ResourceState<{
    readonly balances: ReadonlyArray<{
      readonly asset: 'USDC';
      readonly network: 'BASE-SEPOLIA';
      readonly available: string;
      readonly observedAt: string;
      readonly synchronizationState: 'provider_observed';
    }>;
    readonly reconciliation_state: string;
    readonly environment: 'testnet';
  }>;
  readonly funding: ResourceState<{ readonly environment: 'testnet' }>;
}

export interface AccountSettings {
  readonly profile: AccountContext;
  readonly organization: null | {
    readonly id: string;
    readonly name: string | null;
    readonly role: string | null;
    readonly website: string | null;
    readonly industry: string | null;
    readonly country: string | null;
    readonly organizationSize: string | null;
    readonly aumRange: string | null;
  };
  readonly securityActivity: ReadonlyArray<{
    readonly id: string;
    readonly eventType: string;
    readonly userAgent: string | null;
    readonly createdAt: string;
  }>;
}

export interface CustomerNotification {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly body: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;
}

export interface CustomerDocument {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly createdAt: string;
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

export function getAccountContext(): Promise<AccountContext> {
  return apiRequest<AccountContext>('/v1/account/context');
}

export function getAccountSettings(): Promise<AccountSettings> {
  return apiRequest<AccountSettings>('/v1/account/settings');
}

export function getOnboardingDraftApi(): Promise<{ data: Record<string, unknown>; stepIndex: number }> {
  return apiRequest('/v1/account/onboarding-draft');
}

export function saveOnboardingDraftApi(input: { data: Record<string, unknown>; stepIndex: number }) {
  return apiRequest<{ status: 'saved' }>('/v1/account/onboarding-draft', {
    method: 'POST',
    body: JSON.stringify({ data: input.data, step_index: input.stepIndex }),
  });
}

export function getOverviewState(): Promise<OverviewState> {
  return apiRequest('/v1/customer/overview');
}
export function getPortfolioState(): Promise<PortfolioState> {
  return apiRequest('/v1/customer/portfolio');
}
export function getTreasuryState(): Promise<TreasuryState> {
  return apiRequest('/v1/customer/treasury');
}
export function getAllocationState(): Promise<AllocationState> {
  return apiRequest('/v1/customer/allocation');
}
export function getCapitalAccountState(): Promise<CapitalAccountState> {
  return apiRequest('/v1/capital-account/state');
}

export function getCapitalActivity(params: {
  readonly offset?: number;
  readonly limit?: number;
  readonly status?: string;
  readonly asset?: string;
  readonly network?: string;
  readonly q?: string;
} = {}): Promise<CapitalActivityPage> {
  const search = new URLSearchParams();
  if (params.offset) search.set('offset', String(params.offset));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.asset) search.set('asset', params.asset);
  if (params.network) search.set('network', params.network);
  if (params.q) search.set('q', params.q);
  const query = search.toString();
  return apiRequest(`/v1/capital-activity${query ? `?${query}` : ''}`);
}

export function getCapitalAccountDepositAddress() {
  return apiRequest<{
    asset: 'USDC';
    network: 'BASE-SEPOLIA';
    address: string;
    provider_state: string;
    environment: 'testnet';
  }>('/v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA');
}

export function getNotifications() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly CustomerNotification[] }>(
    '/v1/notifications',
  );
}
export function markNotificationRead(notificationId: string) {
  return apiRequest<{ status: 'updated' }>(
    `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'POST' },
  );
}
export function markAllNotificationsRead() {
  return apiRequest<{ status: 'updated' }>('/v1/notifications/read-all', { method: 'POST' });
}

export function getDocuments() {
  return apiRequest<{ state: 'VALUE' | 'EMPTY'; data: readonly CustomerDocument[] }>('/v1/documents');
}
export function getDocumentDownloadUrl(documentId: string) {
  return apiRequest<{ url: string; expires_in: number }>(
    `/v1/documents/${encodeURIComponent(documentId)}/download`,
    { method: 'POST' },
  );
}
