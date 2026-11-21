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
    "'/v1/preview/clerk/session'",
    "redirect: 'error'",
    'session.organizationId.toLowerCase() !== tenantId.toLowerCase()',
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
const apiOrigin = 'https://api-preview.example.test';
const dependencies = {
  environment: 'preview',
  apiProvider: 'clerk-preview',
  apiOrigin,
  getSessionToken: async () => bearerToken,
  request: async () => Response.json({ principalId, organizationId: tenantId }),
};

test('sends the Clerk bearer to the configured Preview API and accepts the matching organization', async () => {
  const deps = {
    ...dependencies,
    request: async (url, init) => {
      assert.equal(url.href, apiOrigin + '/v1/preview/clerk/session?organization_id=' + tenantId);
      assert.equal(init.method, 'GET');
      assert.equal(init.headers.authorization, 'Bearer ' + bearerToken);
      assert.equal(init.redirect, 'error');
      assert.equal(init.cache, 'no-store');
      assert.ok(init.signal instanceof AbortSignal);
      return Response.json({ principalId, organizationId: tenantId });
    },
  };
  assert.deepEqual(await resolvePreviewClerkApiSession(tenantId.toUpperCase(), deps), {
    bearerToken,
    principalId,
  });
});

test('rejects non-Preview environments and invalid origins before obtaining a token', async () => {
  for (const overrides of [
    { environment: 'production' },
    { apiProvider: 'supabase' },
    { apiOrigin: undefined },
    { apiOrigin: 'http://example.test' },
    { apiOrigin: 'https://user@example.test' },
    { apiOrigin: apiOrigin + '/unexpected' },
  ]) {
    let tokenRequests = 0;
    const deps = { ...dependencies, ...overrides, getSessionToken: async () => { tokenRequests++; } };
    assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
    assert.equal(tokenRequests, 0);
  }
});

test('denies the session if Clerk token retrieval or the API request fails', async () => {
  for (const key of ['getSessionToken', 'request']) {
    const deps = { ...dependencies, [key]: async () => { throw new Error('Unavailable'); } };
    assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
  }
});

test('denies missing, invalid, or cross-tenant API responses', async () => {
  for (const response of [
    new Response(null, { status: 302 }),
    new Response(null, { status: 401 }),
    new Response(null, { status: 503 }),
    new Response('malformed'),
    Response.json(null),
    Response.json({ principalId: 'invalid', organizationId: tenantId }),
    Response.json({ principalId, organizationId: principalId }),
  ]) {
    const deps = { ...dependencies, request: async () => response };
    assert.equal(await resolvePreviewClerkApiSession(tenantId, deps), null);
  }
});
