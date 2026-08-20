import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';

const config = loadConfig({
  NODE_ENV: 'test',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  API_AUTH_MODE: 'CLERK',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com',
});

function commands(calls) {
  return {
    async linkClerkSubject() { throw new Error('not used'); },
    async syncClerkLifecycle() { throw new Error('not used'); },
    async bootstrapClerkPrincipal(input) {
      calls.push(input);
      return { status: 'created', profile_id: 'principal-uuid' };
    },
  };
}

test('Clerk bootstrap uses only server-verified subject and primary email', async () => {
  const calls = [];
  const app = await buildApp({
    config,
    identityCommands: commands(calls),
    verifyClerkIdentity: async (token) =>
      token === 'valid-token'
        ? { subject: 'user_clerk_123', primaryEmail: 'verified@example.com' }
        : null,
  });
  const response = await app.inject({
    method: 'POST',
    url: '/v1/auth/bootstrap',
    headers: { authorization: 'Bearer valid-token' },
    payload: { subject: 'spoofed', email: 'attacker@example.com' },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls, [{
    clerkSubject: 'user_clerk_123',
    verifiedEmail: 'verified@example.com',
    requestId: calls[0].requestId,
  }]);
});

test('Clerk bootstrap rejects missing and invalid sessions before persistence', async () => {
  const calls = [];
  const app = await buildApp({
    config,
    identityCommands: commands(calls),
    verifyClerkIdentity: async () => null,
  });
  const missing = await app.inject({ method: 'POST', url: '/v1/auth/bootstrap' });
  assert.equal(missing.statusCode, 401);
  const invalid = await app.inject({
    method: 'POST',
    url: '/v1/auth/bootstrap',
    headers: { authorization: 'Bearer invalid' },
  });
  assert.equal(invalid.statusCode, 401);
  assert.equal(calls.length, 0);
});
