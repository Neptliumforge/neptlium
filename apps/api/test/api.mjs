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
import { SupabaseRepository } from '../dist/supabase-repository.js';
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
  const repository = new SupabaseRepository(
    'https://example.supabase.co',
    'service',
    async () => new Response('{}', { status: 503 }),
  );
  const app = await buildApp({
    config: production,
    authenticate,
    repository,
    rateLimiter: { consume: async () => ({ remaining: 1, resetAt: Date.now() + 1_000 }) },
    observer: new MemoryObserver(),
  });
  const status = await app.inject({ method: 'GET', url: '/v1/status' });
  assert.equal(status.statusCode, 503);
  assert.equal(status.json().status, 'not_ready');
});
test('general repository readiness probes authoritative profile persistence', async () => {
  const calls = [];
  const repository = new SupabaseRepository(
    'https://example.supabase.co',
    'service',
    async (url) => {
      calls.push(url);
      return new Response('[]', { status: 200 });
    },
  );
  assert.equal(await repository.ready(), true);
  assert.equal(calls.length, 1);
  assert.match(calls[0], /\/profiles\?select=id&limit=1$/);
  assert.doesNotMatch(calls[0], /wallet_accounts/);
});
test('production rejects process-local rate limiting', async () => {
  const production = loadConfig({ NODE_ENV: 'production' });
  await assert.rejects(
    () =>
      buildApp({
        config: production,
        repository: { ready: async () => true },
        financialRepository: { ready: async () => true },
        rateLimiter: new MemoryRateLimiter(),
      }),
    /MemoryRateLimiter cannot be used in production/,
  );
});
test('production rejects MemoryRepository construction', async () => {
  const production = loadConfig({ NODE_ENV: 'production' });
  await assert.rejects(
    () =>
      buildApp({
        config: production,
        repository: new MemoryRepository(),
        rateLimiter: new MemoryRateLimiter(),
      }),
    /MemoryRepository cannot be used/,
  );
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
    410,
  );
});
const circleWallet = {
  provider: 'circle',
  providerWalletId: 'wallet-test',
  providerWalletSetId: 'set-test',
  accountType: 'EOA',
  blockchain: 'BASE-SEPOLIA',
  address: '0x1111111111111111111111111111111111111111',
  environment: 'testnet',
  status: 'live',
};
const circleProvider = {
  identity: 'circle',
  environment: 'testnet',
  readiness: () => 'configured',
  supports: (asset, network) => asset === 'USDC' && network === 'BASE-SEPOLIA',
  provisionWallet: async () => circleWallet,
  lookupWallet: async () => circleWallet,
  getDepositAddress: async (wallet) => wallet,
  getBalances: async () => [
    {
      asset: 'USDC',
      network: 'BASE-SEPOLIA',
      available: '12.5',
      observedAt: '2026-08-10T00:00:00.000Z',
      synchronizationState: 'provider_observed',
    },
  ],
  createTransfer: async () => {
    throw new Error('disabled');
  },
  getTransfer: async () => {
    throw new Error('disabled');
  },
  listTransactions: async () => [],
  reconciliationMetadata: () => ({}),
};
test('Capital Account keeps provider address observation separate from canonical customer balance', async () => {
  const repository = new MemoryRepository();
  repository.linkProviderWallet('user-1', circleWallet);
  const app = await buildApp({ config, authenticate, repository, capitalProvider: circleProvider });
  const headers = { authorization: 'Bearer valid' };
  const address = await app.inject({
    method: 'GET',
    url: '/v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA',
    headers,
  });
  assert.deepEqual(address.json(), {
    asset: 'USDC',
    network: 'BASE-SEPOLIA',
    address: circleWallet.address,
    provider_state: 'live',
    environment: 'testnet',
  });
  const balance = await app.inject({ method: 'GET', url: '/v1/capital-account/balances', headers });
  assert.equal(balance.statusCode, 200);
  assert.equal(balance.json().source, 'NEPTLIUM_CANONICAL_LEDGER');
  assert.equal(balance.json().state, 'EMPTY');
  assert.deepEqual(balance.json().balances, []);
  assert.equal(JSON.stringify(balance.json()).includes('12.5'), false);
});
test('provider wallet access is authenticated, owner-scoped and capability gated', async () => {
  const repository = new MemoryRepository();
  repository.linkProviderWallet('user-1', circleWallet);
  const app = await buildApp({ config, authenticate, repository, capitalProvider: circleProvider });
  assert.equal(
    (await app.inject({ method: 'GET', url: '/v1/capital-account/balances' })).statusCode,
    401,
  );
  assert.equal(
    (
      await app.inject({
        method: 'GET',
        url: '/v1/capital-account/deposit-address?asset=BTC&network=bitcoin-testnet',
        headers: { authorization: 'Bearer valid' },
      })
    ).statusCode,
    422,
  );
  const otherApp = await buildApp({
    config,
    authenticate: async () => ({ id: 'user-2' }),
    repository,
    capitalProvider: circleProvider,
  });
  const otherBalance = await otherApp.inject({
    method: 'GET',
    url: '/v1/capital-account/balances',
    headers: { authorization: 'Bearer valid' },
  });
  assert.equal(otherBalance.statusCode, 200);
  assert.equal(otherBalance.json().source, 'NEPTLIUM_CANONICAL_LEDGER');
  assert.equal(otherBalance.json().state, 'EMPTY');
  assert.deepEqual(otherBalance.json().balances, []);
  assert.equal(
    (
      await otherApp.inject({
        method: 'GET',
        url: '/v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA',
        headers: { authorization: 'Bearer valid' },
      })
    ).statusCode,
    404,
  );
});
test('Circle configuration is explicit and rejects mainnet or partial credentials', () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: 'test', CIRCLE_ENVIRONMENT: 'production' }),
    /ENABLE_MAINNET=true/,
  );
  assert.throws(
    () =>
      loadConfig({ NODE_ENV: 'test', CIRCLE_API_KEY: 'only-one', CIRCLE_ENVIRONMENT: 'testnet' }),
    /CIRCLE_API_KEY.*CIRCLE_ENTITY_SECRET.*CIRCLE_ENVIRONMENT/,
  );
  assert.equal(loadConfig({ NODE_ENV: 'test' }).circleConfigured, false);
});
test('on-demand wallet provisioning is idempotent and returns no provider identifiers', async () => {
  let calls = 0;
  const provider = {
    ...circleProvider,
    provisionWallet: async () => {
      calls += 1;
      return circleWallet;
    },
  };
  const app = await buildApp({ config, authenticate, capitalProvider: provider });
  const headers = { authorization: 'Bearer valid', 'idempotency-key': 'wallet-request-1' };
  const first = await app.inject({
    method: 'POST',
    url: '/v1/capital-account/provider-wallet',
    headers,
  });
  const second = await app.inject({
    method: 'POST',
    url: '/v1/capital-account/provider-wallet',
    headers,
  });
  assert.equal(first.statusCode, 201);
  assert.equal(second.statusCode, 200);
  assert.equal(calls, 1);
  assert.deepEqual(first.json(), { status: 'live', environment: 'testnet' });
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
  const { createServerlessHandler } = await import('../dist/serverless.js');
  const canonical = await buildApp({ config, authenticate, capitalProvider: circleProvider });
  const serverlessHandler = createServerlessHandler(Promise.resolve(canonical));
  const invoke = async ({ method = 'GET', url = '/health', headers = {} } = {}) => {
    const result = { statusCode: 0, headers: {}, body: '' };
    const req = {
      method,
      url,
      headers,
      socket: { remoteAddress: 'test' },
      async *[Symbol.asyncIterator]() {},
    };
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
  const provision = await invoke({
    method: 'POST',
    url: '/v1/capital-account/provider-wallet',
    headers: { authorization: 'Bearer valid', 'idempotency-key': 'serverless-wallet' },
  });
  assert.equal(provision.statusCode, 201);
  const address = await invoke({
    method: 'GET',
    url: '/v1/capital-account/deposit-address?asset=USDC&network=BASE-SEPOLIA',
    headers: { authorization: 'Bearer valid' },
  });
  assert.equal(address.statusCode, 200);
  assert.equal(JSON.parse(address.body).network, 'BASE-SEPOLIA');
});

function durableFixture({ owner = 'user-a', walletId = 'account-a', existing } = {}) {
  const calls = [];
  const request = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.includes('wallet_accounts?')) {
      const requestedOwner = new URL(url).searchParams.get('owner_id')?.replace('eq.', '');
      return new Response(JSON.stringify(requestedOwner === owner ? [{ id: walletId }] : []), {
        status: 200,
      });
    }
    if (url.includes('capital_provider_wallets?'))
      return new Response(JSON.stringify(existing ? [existing] : []), { status: 200 });
    if (url.endsWith('/capital_provider_wallets')) return new Response(init.body, { status: 201 });
    return new Response('{}', { status: 200 });
  };
  return {
    repository: new SupabaseRepository('https://project.supabase.co', 'service-test', request),
    calls,
  };
}
const linkRow = {
  provider: 'circle',
  provider_wallet_id: 'wallet-a',
  provider_wallet_set_id: 'set-a',
  provider_account_type: 'EOA',
  blockchain: 'BASE-SEPOLIA',
  address: circleWallet.address,
  environment: 'testnet',
  status: 'live',
};
const durableLink = { ...circleWallet, providerWalletId: 'wallet-a', providerWalletSetId: 'set-a' };
test('durable repository resolves linkage strictly through authenticated owner wallet account', async () => {
  const own = durableFixture({ existing: linkRow });
  assert.equal((await own.repository.getProviderWallet('user-a')).providerWalletId, 'wallet-a');
  assert.equal(await own.repository.getProviderWallet('user-b'), undefined);
  assert.equal(
    own.calls.some(({ url }) => url.includes('owner_id=eq.user-a')),
    true,
  );
});
test('durable linkage fails closed without canonical account and never accepts client wallet id', async () => {
  const { repository, calls } = durableFixture();
  await assert.rejects(
    () => repository.linkProviderWallet('user-b', circleWallet),
    (error) => error.status === 409,
  );
  assert.equal(
    calls.some(({ init }) => String(init.body).includes('wallet_id')),
    false,
  );
});
test('durable linkage is idempotent only for identical linkage and rejects conflicts', async () => {
  const identical = durableFixture({ existing: linkRow });
  assert.equal(
    (await identical.repository.linkProviderWallet('user-a', durableLink)).providerWalletId,
    'wallet-a',
  );
  const conflict = durableFixture({ existing: linkRow });
  await assert.rejects(
    () =>
      conflict.repository.linkProviderWallet('user-a', {
        ...circleWallet,
        providerWalletId: 'wallet-b',
      }),
    (error) => error.status === 409 && error.code === 'provider_wallet_conflict',
  );
});
test('Circle transfer execution is unconditionally disabled', async () => {
  const { CircleCapitalProvider } = await import('../dist/circle.js');
  const provider = new CircleCapitalProvider({});
  await assert.rejects(
    () =>
      provider.createTransfer({
        wallet: circleWallet,
        idempotencyKey: 'transfer-key',
        asset: 'USDC',
        network: 'BASE-SEPOLIA',
        amount: '1',
        destination: circleWallet.address,
      }),
    (error) => error.code === 'provider_execution_disabled',
  );
});
