import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';
import { Ledger, transition } from '../dist/domain.js';
import { TimestampedHmacTestVerifier } from '../dist/providers.js';
import { MemoryRepository } from '../dist/repositories.js';
import { MemoryRateLimiter } from '../dist/security.js';
import { DurableWorker, MemoryJobStore } from '../dist/workers.js';
import { evaluateWithdrawalPolicy } from '../dist/treasury.js';
import { reconcile } from '../dist/reconciliation.js';
import { MemoryObserver } from '../dist/observability.js';
const config = loadConfig({
  NODE_ENV: 'test',
  API_ALLOWED_ORIGINS: 'http://localhost',
  ALCHEMY_WEBHOOK_SIGNING_KEY: 'test-secret',
});
const authenticate = async (token) => (token === 'valid' ? { id: 'user-1' } : null);
test('health is truthful', async () => {
  const app = await buildApp({ config, authenticate });
  const r = await app.inject({ method: 'GET', url: '/v1/health' });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().database, 'not_configured');
});
test('production readiness fails closed when durable persistence is unavailable', async () => {
  const production = loadConfig({
    NODE_ENV: 'production',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service',
  });
  const repository = new MemoryRepository();
  repository.ready = () => false;
  const app = await buildApp({
    config: production,
    authenticate,
    repository,
    rateLimiter: new MemoryRateLimiter(),
    observer: new MemoryObserver(),
  });
  const status = await app.inject({ method: 'GET', url: '/v1/status' });
  assert.equal(status.statusCode, 503);
  assert.equal(status.json().status, 'not_ready');
});
test('rate limits abusive write bursts without exposing request data', async () => {
  const app = await buildApp({ config, authenticate });
  let response;
  for (let index = 0; index < 31; index++)
    response = await app.inject({
      method: 'POST',
      url: '/v1/wallet/deposit-addresses',
      clientAddress: 'abusive-client',
    });
  assert.equal(response.statusCode, 429);
  assert.equal(response.json().error.code, 'rate_limited');
  assert.equal(Number(response.headers['retry-after']) > 0, true);
});
test('observer records correlated safe request telemetry', async () => {
  const observer = new MemoryObserver();
  const app = await buildApp({ config, authenticate, observer });
  await app.inject({
    method: 'GET',
    url: '/v1/health',
    headers: { authorization: 'Bearer secret-never-log', 'x-request-id': 'req-safe' },
  });
  assert.equal(observer.logs[0].requestId, 'req-safe');
  assert.equal(JSON.stringify(observer.logs).includes('secret-never-log'), false);
});
test('durable worker retries, reclaims leases, and dead-letters deterministically', async () => {
  const store = new MemoryJobStore();
  await store.enqueue('webhook.process', { eventId: 'evt' }, 'evt', 100);
  const worker = new DurableWorker(
    store,
    {
      'webhook.process': async () => {
        throw new Error('temporary');
      },
    },
    { leaseMs: 10, maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 10 },
  );
  await worker.runOnce('worker-1', 100);
  const job = [...store.jobs.values()][0];
  assert.equal(job.state, 'queued');
  await worker.runOnce('worker-2', job.availableAt);
  assert.equal(job.state, 'dead_letter');
  assert.equal(job.attempts, 2);
});
test('treasury policy requires allowlisting and distinct dual approval', () => {
  const policy = {
    asset: 'USDC',
    network: 'base-sepolia',
    singleApprovalLimit: 100n,
    dualApprovalThreshold: 100n,
    maximumAmount: 1000n,
    requireAllowlist: true,
  };
  const review = {
    ownerId: 'owner',
    destination: '0x1',
    amount: 150n,
    asset: 'USDC',
    network: 'base-sepolia',
    approvals: [
      {
        actorId: 'approver-1',
        role: 'approver',
        decision: 'approved',
        createdAt: new Date().toISOString(),
      },
      {
        actorId: 'approver-2',
        role: 'approver',
        decision: 'approved',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  assert.equal(evaluateWithdrawalPolicy(review, policy, false).allowed, false);
  assert.equal(evaluateWithdrawalPolicy(review, policy, true).allowed, true);
});
test('reconciliation emits operator-visible mismatch classifications', () => {
  const report = reconcile('alchemy', [
    { resourceId: 'tx-1', provider: { amount: '2' }, internal: { amount: '1' } },
  ]);
  assert.equal(report.items[0].classification, 'amount_mismatch');
  assert.equal(report.items[0].status, 'open');
});
test('auth and disabled provider fail closed', async () => {
  const app = await buildApp({ config, authenticate });
  assert.equal((await app.inject({ method: 'GET', url: '/v1/wallet/deposits' })).statusCode, 401);
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/v1/wallet/deposit-addresses',
        headers: { authorization: 'Bearer valid' },
        payload: { asset: 'ETH', network: 'base-sepolia' },
      })
    ).statusCode,
    503,
  );
});
test('malformed and oversized bodies return safe validation errors', async () => {
  const app = await buildApp({ config, authenticate });
  const malformed = await app.inject({
    method: 'POST',
    url: '/v1/wallet/withdrawals',
    payload: '{',
  });
  assert.equal(malformed.statusCode, 422);
  assert.equal(malformed.json().error.code, 'validation_failed');
  const oversized = await app.inject({
    method: 'POST',
    url: '/v1/wallet/withdrawals',
    payload: 'x'.repeat(1_048_577),
  });
  assert.equal(oversized.statusCode, 413);
  assert.equal(oversized.json().error.code, 'payload_too_large');
});
test('ledger balances and state transitions enforce rules', () => {
  const l = new Ledger();
  l.post({
    eventType: 'deposit',
    reference: '1',
    postings: [
      { accountId: 'custody', side: 'debit', amount: 10n, asset: 'USDC', network: 'base-sepolia' },
      { accountId: 'user', side: 'credit', amount: 10n, asset: 'USDC', network: 'base-sepolia' },
    ],
  });
  assert.equal(l.balance('user', 'USDC', 'base-sepolia'), 10n);
  assert.throws(() => transition('withdrawal', 'settled', 'requested'));
});
test('idempotency replay and conflict', async () => {
  const app = await buildApp({ config, authenticate });
  const headers = { authorization: 'Bearer valid', 'idempotency-key': 'request-123' },
    payload = {
      asset: 'ETH',
      network: 'base-sepolia',
      amount: '10',
      destination: '0x1111111111111111111111111111111111111111',
    };
  const a = await app.inject({ method: 'POST', url: '/v1/wallet/withdrawals', headers, payload });
  const b = await app.inject({ method: 'POST', url: '/v1/wallet/withdrawals', headers, payload });
  assert.equal(a.json().id, b.json().id);
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/v1/wallet/withdrawals',
        headers,
        payload: { ...payload, amount: '11' },
      })
    ).statusCode,
    409,
  );
});
test('withdrawal cancellation is owner-scoped and idempotent', async () => {
  const app = await buildApp({ config, authenticate });
  const headers = { authorization: 'Bearer valid', 'idempotency-key': 'request-cancel' };
  const created = await app.inject({
    method: 'POST',
    url: '/v1/wallet/withdrawals',
    headers,
    payload: {
      asset: 'ETH',
      network: 'base-sepolia',
      amount: '10',
      destination: '0x1111111111111111111111111111111111111111',
    },
  });
  const url = `/v1/wallet/withdrawals/${created.json().id}/cancel`;
  assert.equal((await app.inject({ method: 'POST', url, headers })).json().state, 'cancelled');
  assert.equal((await app.inject({ method: 'POST', url, headers })).json().state, 'cancelled');
  const createReplay = await app.inject({
    method: 'POST',
    url: '/v1/wallet/withdrawals',
    headers,
    payload: {
      asset: 'ETH',
      network: 'base-sepolia',
      amount: '10',
      destination: '0x1111111111111111111111111111111111111111',
    },
  });
  assert.equal(createReplay.json().state, 'requested');
});
test('provider webhooks fail closed without a reviewed verifier', async () => {
  const app = await buildApp({ config, authenticate });
  const response = await app.inject({ method: 'POST', url: '/v1/webhooks/alchemy', payload: {} });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'provider_not_configured');
});
test('webhooks verify, deduplicate and reject replay', async () => {
  const app = await buildApp({
    config,
    authenticate,
    webhookVerifiers: { alchemy: new TimestampedHmacTestVerifier('test-secret') },
  });
  const timestamp = String(Math.floor(Date.now() / 1000)),
    body = JSON.stringify({ type: 'test' }),
    signature = createHmac('sha256', 'test-secret').update(`${timestamp}.${body}`).digest('hex'),
    headers = {
      'x-webhook-id': 'evt-1',
      'x-webhook-timestamp': timestamp,
      'x-webhook-signature': signature,
    };
  assert.equal(
    (await app.inject({ method: 'POST', url: '/v1/webhooks/alchemy', headers, payload: body }))
      .statusCode,
    202,
  );
  assert.equal(
    (
      await app.inject({ method: 'POST', url: '/v1/webhooks/alchemy', headers, payload: body })
    ).json().duplicate,
    true,
  );
  const changed = JSON.stringify({ type: 'changed' }),
    changedSignature = createHmac('sha256', 'test-secret')
      .update(`${timestamp}.${changed}`)
      .digest('hex');
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/v1/webhooks/alchemy',
        headers: { ...headers, 'x-webhook-signature': changedSignature },
        payload: changed,
      })
    ).statusCode,
    409,
  );
});

test('serverless boundary enforces exact CORS and bearer authentication', async () => {
  const { serverlessHandler } = await import('../dist/serverless.js');
  const invoke = async ({ method = 'GET', url = '/health', headers = {} } = {}) => {
    const result = { statusCode: 0, headers: {}, body: '' };
    const req = { method, url, headers };
    const res = {
      setHeader(name, value) {
        result.headers[name.toLowerCase()] = value;
      },
      writeHead(status, responseHeaders) {
        result.statusCode = status;
        Object.assign(result.headers, responseHeaders);
      },
      end(body = '') {
        result.body = body;
      },
    };
    await serverlessHandler(req, res);
    return result;
  };
  const health = await invoke();
  assert.equal(health.statusCode, 200);
  const rejectedOrigin = await invoke({ headers: { origin: 'https://attacker.example' } });
  assert.equal(rejectedOrigin.statusCode, 403);
  const missingToken = await invoke({ method: 'POST', url: '/v1/account/provision' });
  assert.equal(missingToken.statusCode, 401);
  assert.equal(JSON.parse(missingToken.body).error.code, 'authentication_required');
});
