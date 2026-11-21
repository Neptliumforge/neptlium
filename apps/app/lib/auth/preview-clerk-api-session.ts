import 'server-only';

export interface PreviewClerkSessionDependencies {
  readonly environment: string | undefined;
  readonly apiProvider: string | undefined;
  /** Dedicated server-configured Preview API origin. */
  readonly apiOrigin: string | undefined;
  /** Acquire the JWT from the authenticated Clerk server session. */
  readonly getSessionToken: () => Promise<string | null>;
  readonly request?: typeof fetch;
}

const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolvePreviewClerkApiSession(
  tenantId: string,
  deps: PreviewClerkSessionDependencies,
): Promise<{ readonly bearerToken: string; readonly principalId: string } | null> {
  if (deps.environment !== 'preview' || deps.apiProvider !== 'clerk-preview' || !UUID.test(tenantId)) {
    return null;
  }

  try {
    if (!deps.apiOrigin) return null;
    const origin = new URL(deps.apiOrigin);
    if (origin.protocol !== 'https:' || origin.origin !== deps.apiOrigin) return null;

    const token = await deps.getSessionToken();
    if (!token || token.length > 16384 || !JWT.test(token)) return null;

    const target = new URL('/v1/preview/clerk/session', origin);
    target.searchParams.set('organization_id', tenantId.toLowerCase());
    const response = await (deps.request ?? fetch)(target, {
      method: 'GET',
      headers: { accept: 'application/json', authorization: `Bearer ${token}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    if (response.status !== 200) return null;
    const session = await response.json() as { principalId?: unknown; organizationId?: unknown } | null;
    if (typeof session?.principalId !== 'string' || !UUID.test(session.principalId) ||
        typeof session.organizationId !== 'string' || session.organizationId.toLowerCase() !== tenantId.toLowerCase()) {
      return null;
    }
    return { bearerToken: token, principalId: session.principalId };
  } catch {
    return null;
  }
}
