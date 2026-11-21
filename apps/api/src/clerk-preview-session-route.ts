import { clerkApiReadiness } from './clerk-token-boundary.js';
import { createClerkPreviewAuthorizer } from './clerk-preview-middleware.js';
import { SupabaseClerkPreviewIdentityStore } from './clerk-preview-identity.js';

function httpsOrigin(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const url = URL.parse(input);
  return url?.protocol === 'https:' && url.origin === input ? input : undefined;
}

export function clerkPreviewRouteConfig(env: Readonly<Record<string, string | undefined>>) {
  if (!clerkApiReadiness(env).ready || env.VERCEL_TARGET_ENV === 'production') return undefined;
  const issuer = httpsOrigin(env.NEPTLIUM_CLERK_PREVIEW_ISSUER);
  const audience = env.NEPTLIUM_CLERK_PREVIEW_AUDIENCE?.trim();
  const authorizedParty = httpsOrigin(env.NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN);
  const databaseUrl = httpsOrigin(env.NEPTLIUM_CLERK_PREVIEW_SUPABASE_URL);
  const databaseKey = env.NEPTLIUM_CLERK_PREVIEW_SUPABASE_SERVICE_ROLE_KEY;
  if (!issuer || !audience || !authorizedParty || !databaseUrl || !databaseKey ||
      databaseUrl === URL.parse(env.SUPABASE_URL ?? '')?.origin ||
      databaseKey === env.SUPABASE_SERVICE_ROLE_KEY) return undefined;
  return { issuer, audience, authorizedParty, databaseUrl, databaseKey };
}

export function createClerkPreviewSessionRoute(
  config: ReturnType<typeof clerkPreviewRouteConfig>,
  request: typeof fetch = fetch,
) {
  if (!config) return undefined;
  const store = new SupabaseClerkPreviewIdentityStore(config.databaseUrl, config.databaseKey, request);
  const authorize = createClerkPreviewAuthorizer({
    issuer: config.issuer,
    audience: config.audience,
    authorizedParties: [config.authorizedParty],
  }, store, request);
  return (headers: Readonly<Record<string, string | undefined>>, organizationId: string) =>
    authorize(headers, organizationId.toLowerCase(), 'preview');
}
