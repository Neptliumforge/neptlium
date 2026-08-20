import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrincipalAuthenticator } from '../dist/authentication.js';
import { loadConfig } from '../dist/config.js';

const baseEnv = {
  NODE_ENV: 'test',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
};

const resolver = {
  async resolveActivePrincipal(provider, providerSubject) {
    if (providerSubject === 'unknown') return null;
    return {
      principal: {
        id: '11111111-1111-4111-8111-111111111111',
        status: 'ACTIVE',
        createdAt: new Date(0).toISOString(),
        suspendedAt: null,
        retiredAt: null,
      },
      provider,
      providerSubject,
      linkedAt: new Date(0).toISOString(),
    };
  },
};

test('Clerk mode verifies the Clerk subject and returns only the internal principal UUID', async () => {
  const config = loadConfig({
    ...baseEnv,
    API_AUTH_MODE: 'CLERK',
    CLERK_SECRET_KEY: 'sk_test_fixture',
    CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com,https://admin.neptlium.com',
  });
  const authenticate = createPrincipalAuthenticator(
    config,
    resolver,
    async () => {
      throw new Error('Supabase verification must not run in Clerk mode');
    },
    async () => 'user_clerk_subject',
  );
  assert.deepEqual(await authenticate('clerk-token'), {
    id: '11111111-1111-4111-8111-111111111111',
    provider: 'CLERK',
    providerSubject: 'user_clerk_subject',
  });
});

test('dual mode accepts current Supabase sessions but resolves their stable principal', async () => {
  const config = loadConfig({
    ...baseEnv,
    API_AUTH_MODE: 'DUAL',
    CLERK_SECRET_KEY: 'sk_test_fixture',
    CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com',
  });
  const authenticate = createPrincipalAuthenticator(
    config,
    resolver,
    async () => new Response(JSON.stringify({ id: 'supabase-subject' }), { status: 200 }),
    async () => null,
  );
  assert.equal((await authenticate('supabase-token'))?.id, '11111111-1111-4111-8111-111111111111');
});

test('unknown Clerk subject, missing mapping storage, and unsafe configuration fail closed', async () => {
  assert.throws(
    () => loadConfig({ ...baseEnv, API_AUTH_MODE: 'CLERK' }),
    /CLERK_SECRET_KEY and CLERK_AUTHORIZED_PARTIES/,
  );
  const config = loadConfig({
    ...baseEnv,
    API_AUTH_MODE: 'CLERK',
    CLERK_SECRET_KEY: 'sk_test_fixture',
    CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com',
  });
  const unknown = createPrincipalAuthenticator(config, resolver, fetch, async () => 'unknown');
  assert.equal(await unknown('token'), null);
  const unavailable = createPrincipalAuthenticator(config, undefined, fetch, async () => 'known');
  await assert.rejects(() => unavailable('token'), /Identity mapping is unavailable/);
});
