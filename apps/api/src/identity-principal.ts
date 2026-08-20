import { ApiError } from './errors.js';

export type IdentityProvider = 'SUPABASE_AUTH' | 'CLERK';
export type IdentityPrincipalStatus = 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
export type IdentityProviderSubjectStatus = 'ACTIVE' | 'REVOKED';

export interface IdentityPrincipal {
  id: string;
  status: IdentityPrincipalStatus;
  createdAt: string;
  suspendedAt: string | null;
  retiredAt: string | null;
}

export interface ResolvedIdentityPrincipal {
  principal: IdentityPrincipal;
  provider: IdentityProvider;
  providerSubject: string;
  linkedAt: string;
}

export interface IdentityPrincipalResolver {
  resolveActivePrincipal(
    provider: IdentityProvider,
    providerSubject: string,
  ): Promise<ResolvedIdentityPrincipal | null>;
}

type Fetch = typeof fetch;

type ProviderSubjectRow = {
  principal_id: string;
  provider: IdentityProvider;
  provider_subject: string;
  status: IdentityProviderSubjectStatus;
  linked_at: string;
};

type PrincipalRow = {
  id: string;
  status: IdentityPrincipalStatus;
  created_at: string;
  suspended_at: string | null;
  retired_at: string | null;
};

const supportedProviders = new Set<IdentityProvider>(['SUPABASE_AUTH', 'CLERK']);

export class SupabaseIdentityPrincipalResolver implements IdentityPrincipalResolver {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {
    if (!url || !serviceRoleKey)
      throw new Error('Identity principal resolution requires Supabase server credentials');
  }

  private headers(): HeadersInit {
    return {
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      'content-type': 'application/json',
    };
  }

  private async rows<T>(path: string): Promise<T[]> {
    const response = await this.request(`${this.url}/rest/v1/${path}`, {
      headers: this.headers(),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok)
      throw new ApiError(
        503,
        'identity_storage_unavailable',
        'Identity principal storage is unavailable',
      );
    return (await response.json()) as T[];
  }

  async resolveActivePrincipal(
    provider: IdentityProvider,
    providerSubject: string,
  ): Promise<ResolvedIdentityPrincipal | null> {
    if (!supportedProviders.has(provider))
      throw new ApiError(400, 'invalid_identity_provider', 'Identity provider is unsupported');
    if (
      !providerSubject ||
      providerSubject !== providerSubject.trim() ||
      providerSubject.length > 255
    )
      throw new ApiError(400, 'invalid_identity_subject', 'Identity subject is invalid');

    const subjects = await this.rows<ProviderSubjectRow>(
      `identity_provider_subjects?provider=eq.${encodeURIComponent(provider)}` +
        `&provider_subject=eq.${encodeURIComponent(providerSubject)}` +
        '&status=eq.ACTIVE' +
        '&select=principal_id,provider,provider_subject,status,linked_at' +
        '&limit=2',
    );
    if (subjects.length === 0) return null;
    if (subjects.length !== 1)
      throw new ApiError(503, 'identity_mapping_ambiguous', 'Identity mapping is ambiguous');

    const subject = subjects[0]!;
    const principals = await this.rows<PrincipalRow>(
      `identity_principals?id=eq.${encodeURIComponent(subject.principal_id)}` +
        '&status=eq.ACTIVE' +
        '&select=id,status,created_at,suspended_at,retired_at' +
        '&limit=2',
    );
    if (principals.length === 0) return null;
    if (principals.length !== 1)
      throw new ApiError(503, 'identity_mapping_ambiguous', 'Identity principal is ambiguous');

    const principal = principals[0]!;
    return {
      principal: {
        id: principal.id,
        status: principal.status,
        createdAt: principal.created_at,
        suspendedAt: principal.suspended_at,
        retiredAt: principal.retired_at,
      },
      provider: subject.provider,
      providerSubject: subject.provider_subject,
      linkedAt: subject.linked_at,
    };
  }
}

export class SupabaseIdentityCommandRepository {
  constructor(
    private readonly url: string,
    private readonly anonKey: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {}

  private async rpc(
    name: string,
    body: Record<string, unknown>,
    bearerToken: string,
    apiKey: string,
  ): Promise<Record<string, unknown>> {
    const response = await this.request(`${this.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${bearerToken}`,
        apikey: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok)
      throw new ApiError(409, 'identity_link_unavailable', 'Identity linking is unavailable');
    return (await response.json()) as Record<string, unknown>;
  }

  linkClerkSubject(input: {
    supabaseAccessToken: string;
    clerkSubject: string;
    idempotencyKey: string;
    requestId: string;
  }) {
    return this.rpc(
      'link_clerk_identity_subject',
      {
        p_clerk_subject: input.clerkSubject,
        p_idempotency_key: input.idempotencyKey,
        p_request_id: input.requestId,
      },
      input.supabaseAccessToken,
      this.anonKey,
    );
  }

  syncClerkLifecycle(input: {
    clerkSubject: string;
    eventId: string;
    eventType: string;
    eventDigest: string;
  }) {
    return this.rpc(
      'sync_clerk_identity_lifecycle',
      {
        p_clerk_subject: input.clerkSubject,
        p_event_id: input.eventId,
        p_event_type: input.eventType,
        p_event_digest: input.eventDigest,
      },
      this.serviceRoleKey,
      this.serviceRoleKey,
    );
  }
}
