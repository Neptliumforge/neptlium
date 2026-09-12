import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrincipalAuthenticator } from '../dist/authentication.js';
import { loadConfig } from '../dist/config.js';

const baseEnv = {
  NODE_ENV: 'test',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com,https://admin.neptlium.com',
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

test('Clerk subject resolves to the stable Neptlium principal', async () => {
  const config = loadConfig(baseEnv);
  const authenticate = createPrincipalAuthenticator(config, resolver, fetch, async () => 'user_clerk_subject');
  assert.deepEqual(await authenticate('clerk-token'), {
    id: '11111111-1111-4111-8111-111111111111',
    provider: 'CLERK',
    providerSubject: 'user_clerk_subject',
  });
});

test('non-Clerk tokens are never accepted through a legacy verification fallback', async () => {
  const config = loadConfig({ ...baseEnv, API_AUTH_MODE: 'DUAL' });
  const authenticate = createPrincipalAuthenticator(
    config,
    resolver,
    async () => { throw new Error('legacy provider verification must never run'); },
    async () => null,
  );
  assert.equal(await authenticate('legacy-token'), null);
  assert.equal(config.AUTH_MODE, 'CLERK');
});

test('unknown Clerk subjects and unavailable identity mapping fail closed', async () => {
  const config = loadConfig(baseEnv);
  const unknown = createPrincipalAuthenticator(config, resolver, fetch, async () => 'unknown');
  assert.equal(await unknown('token'), null);
  const unavailable = createPrincipalAuthenticator(config, undefined, fetch, async () => 'known');
  await assert.rejects(() => unavailable('token'), /Identity mapping is unavailable/);
});
