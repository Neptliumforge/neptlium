import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';
import { verifyAlchemyWebhook } from '../dist/alchemy-observation.js';

const signingKey = 'alchemy-production-signing-key';

const config = loadConfig({
  NODE_ENV: 'test',
  API_ALLOWED_ORIGINS: 'http://localhost',
  ENABLE_MAINNET: 'true',

  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',

  ALCHEMY_ENVIRONMENT: 'production',
  ALCHEMY_API_KEY: 'alchemy-api-key',
  ALCHEMY_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/alchemy-api-key',
  ALCHEMY_WEBHOOK_SIGNING_KEY: signingKey,

  ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED: 'false',

  ENABLE_WALLET_PROVISIONING: 'false',
  ENABLE_CRYPTO_DEPOSITS: 'false',
  ENABLE_CRYPTO_WITHDRAWALS: 'false',
});

const payload = {
  webhookId: 'wh_123',
  id: 'whevt_123',
  createdAt: '2026-09-08T00:00:00.000Z',
  type: 'ADDRESS_ACTIVITY',
  event: {
    network: 'BASE_MAINNET',
  },
};

const rawBody = Buffer.from(JSON.stringify(payload));
const signature = createHmac('sha256', signingKey)
  .update(rawBody)
  .digest('hex');

test('Alchemy verifier implements the official raw-body HMAC contract', () => {
  assert.doesNotThrow(() =>
    verifyAlchemyWebhook({
      rawBody,
      signatureHeader: signature,
      signingKey,
    }),
  );

  assert.throws(() =>
    verifyAlchemyWebhook({
      rawBody,
      signatureHeader: '00'.repeat(32),
      signingKey,
    }),
  );
});

test('Alchemy production ingress verifies and durably records payload event identity', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    });

    return new Response('', { status: 201 });
  };

  try {
    const app = await buildApp({ config });

    const response = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/alchemy',
      headers: {
        'x-alchemy-signature': signature,
      },
      payload,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().received, true);
    assert.equal(response.json().duplicate, false);

    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /provider_webhook_inbox$/);
    assert.equal(calls[0].method, 'POST');

    assert.equal(calls[0].body.provider, 'alchemy');
    assert.equal(calls[0].body.environment, 'live');
    assert.equal(calls[0].body.provider_event_id, payload.id);
    assert.equal(
      calls[0].body.payload_digest,
      createHash('sha256').update(rawBody).digest('hex'),
    );
    assert.equal(calls[0].body.processing_state, 'received');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Alchemy ingress fails closed before storage when signature is absent', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    return new Response('', { status: 201 });
  };

  try {
    const app = await buildApp({ config });

    const response = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/alchemy',
      payload,
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.json().error.code, 'invalid_webhook');
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('production Alchemy ingress never falls back to the legacy injected verifier when durable storage is unavailable', async () => {
  let legacyVerifierCalls = 0;

  const productionWithoutStorage = {
    ...config,
    SUPABASE_URL: undefined,
    SUPABASE_ANON_KEY: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
  };

  const app = await buildApp({
    config: productionWithoutStorage,
    webhookVerifiers: {
      alchemy: {
        verify: async () => {
          legacyVerifierCalls += 1;
        },
      },
    },
  });

  const response = await app.inject({
    method: 'POST',
    url: '/v1/webhooks/alchemy',
    headers: {
      'x-alchemy-signature': signature,
      'x-webhook-id': 'legacy-fallback-must-not-run',
    },
    payload,
  });

  assert.equal(response.statusCode, 503);
  assert.equal(
    response.json().error.code,
    'financial_storage_unavailable',
  );
  assert.equal(legacyVerifierCalls, 0);
});
