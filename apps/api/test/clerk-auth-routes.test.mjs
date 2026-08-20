import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';

const config = loadConfig({
  NODE_ENV: 'test',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_ANON_KEY: 'anon-test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  API_AUTH_MODE: 'DUAL',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  CLERK_AUTHORIZED_PARTIES: 'https://app.neptlium.com',
  CLERK_WEBHOOK_SIGNING_SECRET: 'whsec_fixture',
});

test('link endpoint requires both verified sessions and forwards no email identity', async () => {
  const calls = [];
  const app = await buildApp({
    config,
    verifyClerkSubject: async (token) => (token === 'clerk-token' ? 'user_clerk_123' : null),
    identityCommands: {
      async linkClerkSubject(input) {
        calls.push(input);
        return { principal_id: 'principal-uuid', linked: true };
      },
      async syncClerkLifecycle() {
        throw new Error('not used');
      },
    },
  });
  const response = await app.inject({
    method: 'POST',
    url: '/v1/auth/link-clerk',
    headers: {
      authorization: 'Bearer current-supabase-token',
      'x-clerk-session-token': 'clerk-token',
      'idempotency-key': 'link-command-123',
    },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(calls, [
    {
      supabaseAccessToken: 'current-supabase-token',
      clerkSubject: 'user_clerk_123',
      idempotencyKey: 'link-command-123',
      requestId: calls[0].requestId,
    },
  ]);
  assert.equal(JSON.stringify(calls).includes('email'), false);
});

test('verified Clerk lifecycle webhook is correlated and invalid signatures fail closed', async () => {
  const calls = [];
  const identityCommands = {
    async linkClerkSubject() {
      throw new Error('not used');
    },
    async syncClerkLifecycle(input) {
      calls.push(input);
      return { accepted: true };
    },
  };
  const app = await buildApp({
    config,
    identityCommands,
    verifyClerkWebhook: async () => ({
      type: 'user.deleted',
      data: { id: 'user_clerk_123', deleted: true, object: 'user' },
    }),
  });
  const response = await app.inject({
    method: 'POST',
    url: '/v1/webhooks/clerk',
    headers: { 'svix-id': 'evt_12345678' },
    payload: { type: 'user.deleted' },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(calls[0].clerkSubject, 'user_clerk_123');
  assert.equal(calls[0].eventId, 'evt_12345678');
  assert.match(calls[0].eventDigest, /^[0-9a-f]{64}$/);

  const rejected = await buildApp({
    config,
    identityCommands,
    verifyClerkWebhook: async () => {
      throw new Error('bad signature');
    },
  });
  const invalid = await rejected.inject({
    method: 'POST',
    url: '/v1/webhooks/clerk',
    headers: { 'svix-id': 'evt_12345678' },
    payload: {},
  });
  assert.equal(invalid.statusCode, 401);
});
