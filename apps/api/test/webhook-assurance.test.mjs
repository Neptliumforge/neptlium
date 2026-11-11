import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, generateKeyPairSync, sign } from 'node:crypto';
import { verifyCircleWebhook, CirclePublicKeys } from '../dist/circle-webhook.js';
import { verifyAlchemyWebhook, validateAlchemyEnvelope } from '../dist/alchemy-observation.js';
import { processStoredWebhook, recoverWebhooks } from '../dist/webhook-assurance.js';
import { handleFinancialRoute } from '../dist/financial-routes.js';
import { loadConfig } from '../dist/config.js';

const event = { provider: 'stripe', environment: 'test', providerEventId: 'evt_test' };
const payload = {
  id: 'evt_test',
  type: 'customer.subscription.deleted',
  livemode: false,
  created: 123,
  data: { object: { id: 'sub_test', customer: 'cus_test', status: 'canceled' } },
};

test('Circle ingress remains unavailable with default configuration', async () => {
  await assert.rejects(
    () =>
      handleFinancialRoute(
        {
          method: 'POST',
          path: '/v1/webhooks/circle',
          headers: {},
          body: {},
          rawBody: Buffer.from('{}'),
          query: new URLSearchParams(),
        },
        {
          config: loadConfig({ NODE_ENV: 'test' }),
          repository: {},
          ownerId: async () => assert.fail('webhook is not customer authorization'),
        },
      ),
    (error) => error.status === 503 && error.code === 'provider_not_configured',
  );
});

test('only the acquired fence may process concurrent deliveries; stored payload drives processing', async () => {
  let held = false;
  let applications = 0;
  const store = {
    claim: async () => {
      if (held) return { acquired: false, state: 'processing' };
      held = true;
      return { acquired: true, state: 'processing', token: 'fence-1', payload };
    },
    finish: async (_scope, token, disposition) => {
      assert.equal(token, 'fence-1');
      assert.equal(disposition.command.status, 'canceled');
      applications++;
    },
    fail: async () => assert.fail('unexpected failure'),
  };
  const outcomes = await Promise.all([
    processStoredWebhook(store, event),
    processStoredWebhook(store, event),
  ]);
  assert.equal(applications, 1);
  assert.deepEqual(outcomes.sort(), ['deferred', 'processed']);
});

test('failed finish records safe failure; recovery retries persisted events without a new signature', async () => {
  let finished = 0;
  const failures = [];
  const store = {
    claim: async () => ({ acquired: true, state: 'processing', token: 'new-fence', payload }),
    finish: async () => {
      if (++finished === 1) throw new Error('private upstream response');
    },
    fail: async (_scope, token, code) => failures.push({ token, code }),
    due: async () => [event],
  };
  await assert.rejects(() => processStoredWebhook(store, event));
  assert.deepEqual(failures, [{ token: 'new-fence', code: 'webhook_processing_failed' }]);
  assert.deepEqual(await recoverWebhooks(store, 10), { processed: 1, deferred: 0, failed: 0 });
});

test('missing or legacy fence result never authorizes processing', async () => {
  const store = {
    claim: async () => ({ processing_state: 'processing' }),
    finish: async () => assert.fail('no fence'),
  };
  await assert.rejects(() => processStoredWebhook(store, event), /claim contract/);
});

test('Circle ECDSA verifies raw bytes with bounded trusted key lookup and caches by key id', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const keyId = '11111111-1111-4111-8111-111111111111';
  let calls = 0;
  const keys = new CirclePublicKeys('testnet', 'test-api-key', async (url, init) => {
    calls++;
    assert.equal(url, `https://api.circle.com/v2/notifications/publicKey/${keyId}`);
    assert.equal(init.redirect, 'error');
    return Response.json({
      data: {
        id: keyId,
        algorithm: 'ECDSA_SHA_256',
        publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
      },
    });
  });
  const body = Buffer.from(
    JSON.stringify({
      version: 2,
      notificationId: keyId,
      subscriptionId: keyId,
      notificationType: 'transactions.inbound',
      timestamp: '2026-11-11T00:00:00Z',
      notification: { id: 'transaction-1' },
    }),
  );
  const signature = sign('sha256', body, privateKey).toString('base64');
  const input = {
    rawBody: body,
    signature,
    keyId,
    keys,
    subscriptionId: keyId,
    environment: 'testnet',
  };
  assert.equal((await verifyCircleWebhook(input)).notificationId, keyId);
  await verifyCircleWebhook(input);
  assert.equal(calls, 1);
  await assert.rejects(() =>
    verifyCircleWebhook({ ...input, rawBody: Buffer.concat([body, Buffer.from(' ')]) }),
  );
  await assert.rejects(() => verifyCircleWebhook({ ...input, keyId: '../../private' }));
  await assert.rejects(() => verifyCircleWebhook({ ...input, subscriptionId: 'other' }));
  await assert.rejects(() => verifyCircleWebhook({ ...input, environment: 'production' }));
  assert.equal(calls, 1);
});

test('Alchemy rejects malformed signatures and signed events outside configured webhook/type/network', () => {
  const body = Buffer.from('{}');
  const signature = createHmac('sha256', 'key').update(body).digest('hex');
  assert.throws(() =>
    verifyAlchemyWebhook({ rawBody: body, signatureHeader: `${signature}zz`, signingKey: 'key' }),
  );
  const value = {
    id: 'event-1',
    webhookId: 'wh_1',
    type: 'ADDRESS_ACTIVITY',
    createdAt: '2026-11-11T00:00:00Z',
    event: { network: 'BASE_MAINNET', activity: [] },
  };
  const binding = { webhookId: 'wh_1', environment: 'production' };
  assert.equal(validateAlchemyEnvelope(value, binding).id, 'event-1');
  for (const changed of [
    { webhookId: 'other' },
    { type: 'GRAPHQL' },
    { event: { network: 'ETH_MAINNET' } },
  ])
    assert.throws(() => validateAlchemyEnvelope({ ...value, ...changed }, binding));
  assert.throws(() => validateAlchemyEnvelope(value, { ...binding, webhookId: undefined }));
});
