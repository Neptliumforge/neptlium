import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';

const read = (p) => readFileSync(resolve(import.meta.dirname, '..', p), 'utf8');

test('Preview Clerk API adapter requires server-only environment and tenant-scoped resolution', () => {
  const source = read('lib/auth/preview-clerk-api-session.ts');
  for (const required of [
    "import 'server-only'",
    "deps.environment !== 'preview'",
    "deps.apiProvider !== 'clerk-preview'",
    'deps.getSessionToken()',
    'deps.resolveVerifiedPrincipal(token, tenantId)',
    'requireVerifiedClerkPrincipal(resolution)',
    'resolution.requestedTenantId.toLowerCase() !== tenantId.toLowerCase()',
  ]) assert.ok(source.includes(required), `missing preview boundary: ${required}`);
  assert.doesNotMatch(source, /createSupabaseBrowserClient|service_role|localStorage/);
});

test('production API client remains unchanged until verified end-to-end cutover', () => {
  const client = read('lib/api/client.ts');
  assert.match(client, /supabase\.auth\.getUser\(\)/);
  assert.match(client, /supabase\.auth\.getSession\(\)/);
  assert.doesNotMatch(client, /resolvePreviewClerkApiSession/);
});

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only' && context.parentURL?.endsWith('/preview-clerk-api-session.ts')) {
      return nextResolve('data:text/javascript,export%20{}', context);
    }
    return nextResolve(specifier, context);
  },
});
const { resolvePreviewClerkApiSession } = await import('../lib/auth/preview-clerk-api-session.ts')
  .finally(() => hooks.deregister());

const tenantId = '7e0df9d1-1113-4d23-889a-84fa18136bfc';
const principalId = 'efcd0855-2966-44dc-b7b2-f88d682cdada';
const bearerToken = 'test.header.signature';
const resolution = {
  verifiedProvider: 'clerk',
  providerSubject: 'user_preview',
  principalId,
  activePrincipal: true,
  activeProviderLink: true,
  activeMembership: true,
  tenantId,
  requestedTenantId: tenantId,
};
const dependencies = {
  environment: 'preview',
  apiProvider: 'clerk-preview',
  getSessionToken: async () => bearerToken,
  resolveVerifiedPrincipal: async () => resolution,
};

test('returns an API-verified session for the requested tenant', async () => {
  assert.deepEqual(await resolvePreviewClerkApiSession(tenantId, dependencies), {
    bearerToken,
    principalId,
  });
});

test('denies the session if Clerk token retrieval fails', async () => {
  const deps = {
    ...dependencies,
    getSessionToken: async () => { throw new Error('Clerk unavailable'); },
  };
  assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
});

test('denies the session when API principal resolution fails', async () => {
  const deps = {
    ...dependencies,
    resolveVerifiedPrincipal: async () => { throw new Error('API unavailable'); },
  };
  assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
});

test('denies an API resolution for a different tenant', async () => {
  const deps = {
    ...dependencies,
    resolveVerifiedPrincipal: async () => ({
      ...resolution,
      requestedTenantId: principalId,
      tenantId: principalId,
    }),
  };
  assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
});
