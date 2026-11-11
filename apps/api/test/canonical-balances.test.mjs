import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../dist/config.js';
import { handleFinancialRoute } from '../dist/financial-routes.js';
import {
  MemoryFinancialRepository,
  SupabaseFinancialRepository,
} from '../dist/financial-repository.js';

const config = loadConfig({ NODE_ENV: 'test' });
const owner = '00000000-0000-4000-8000-000000000001';
const ownerId = async () => owner;
const request = () => ({
  method: 'GET',
  path: '/v1/capital-account/balances',
  query: new URLSearchParams(),
  headers: {},
  body: undefined,
  rawBody: Buffer.alloc(0),
});
const balance = (overrides = {}) => ({
  asset: 'USDC',
  network: 'BASE',
  totalAtomic: '0',
  availableAtomic: '0',
  reservedAtomic: '0',
  pendingAtomic: '0',
  restrictedAtomic: '0',
  ...overrides,
});
const read = async (repository) =>
  (await handleFinancialRoute(request(), { config, repository, ownerId })).data;

test('an account without an established ledger is NOT_INITIALIZED, never zero', async () => {
  const data = await read(new MemoryFinancialRepository());
  assert.equal(data.contract_version, 2);
  assert.equal(data.state, 'NOT_INITIALIZED');
  assert.equal(data.ledger_initialized_at, null);
  assert.deepEqual(data.reporting, {
    currency: 'USD',
    decimals: 2,
    total_minor: null,
    valuation: 'UNAVAILABLE',
  });
  assert.deepEqual(data.balances, []);
});

test('an initialized ledger with no postings is an exact USD zero', async () => {
  const repository = new MemoryFinancialRepository();
  repository.initializedOwners.set(owner, '2026-10-21T00:00:00Z');
  const data = await read(repository);
  assert.equal(data.state, 'ZERO');
  assert.equal(data.ledger_initialized_at, '2026-10-21T00:00:00Z');
  assert.equal(data.reporting.total_minor, '0');
  assert.equal(data.reporting.valuation, 'ZERO_LEDGER');
});

test('capital accounts that net to zero are ZERO even without an initialization row', async () => {
  const repository = new MemoryFinancialRepository();
  repository.balancesByOwner.set(owner, [balance()]);
  const data = await read(repository);
  assert.equal(data.state, 'ZERO');
  assert.equal(data.reporting.total_minor, '0');
  assert.equal(data.balances[0].atomic_precision, 6);
});

test('non-zero balances carry governed precision and are never priced by assumption', async () => {
  const repository = new MemoryFinancialRepository();
  repository.initializedOwners.set(owner, '2026-10-21T00:00:00Z');
  repository.balancesByOwner.set(owner, [
    balance({ totalAtomic: '1500000', availableAtomic: '1000000', reservedAtomic: '500000' }),
  ]);
  const data = await read(repository);
  assert.equal(data.state, 'VALUE');
  assert.equal(data.reporting.total_minor, null);
  assert.equal(data.reporting.valuation, 'UNAVAILABLE');
  assert.equal(data.balances[0].atomic_precision, 6);
  assert.equal(data.balances[0].decimals, 6);
  assert.equal(data.balances[0].available_atomic, '1000000');
});

test('an asset without governed precision reports null precision, not a guess', async () => {
  const repository = new MemoryFinancialRepository();
  repository.balancesByOwner.set(owner, [
    balance({ asset: 'USDC', network: 'UNGOVERNED', totalAtomic: '1', availableAtomic: '1' }),
  ]);
  const data = await read(repository);
  assert.equal(data.state, 'VALUE');
  assert.equal(data.balances[0].atomic_precision, null);
  assert.equal(data.balances[0].decimals, null);
});

test('a negative capital component fails closed as an integrity defect', async () => {
  const repository = new MemoryFinancialRepository();
  repository.balancesByOwner.set(owner, [balance({ totalAtomic: '-1', availableAtomic: '-1' })]);
  await assert.rejects(
    () => read(repository),
    (error) => error.status === 503 && error.code === 'canonical_balance_integrity',
  );
});

test('the Supabase repository aggregates through the database and keeps exact strings', async () => {
  const calls = [];
  const fetchStub = async (url, init) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({
        initialized_at: null,
        balances: [
          {
            asset: 'ETH',
            network: 'BASE',
            available_atomic: '1000000000000000000000000000001',
            reserved_atomic: '0',
            pending_atomic: '0',
            restricted_atomic: '0',
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };
  const repository = new SupabaseFinancialRepository('https://db.test', 'service-key', fetchStub);
  const summary = await repository.getCanonicalBalanceSummary(owner);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://db.test/rest/v1/rpc/canonical_capital_balance_summary');
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), { p_owner_id: owner });
  assert.equal(summary.balances[0].availableAtomic, '1000000000000000000000000000001');
  assert.equal(summary.balances[0].totalAtomic, '1000000000000000000000000000001');
  assert.deepEqual(await repository.getCanonicalBalances(owner), summary.balances);
});

test('an unavailable or malformed aggregation is a 503, never an empty or zero balance', async () => {
  const respond =
    (body, status = 200) =>
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      });
  for (const fetchStub of [
    respond({ message: 'function does not exist' }, 404),
    respond({
      initialized_at: null,
      balances: [{ asset: 'USDC', network: 'BASE', available_atomic: 1e21 }],
    }),
    respond({
      initialized_at: null,
      balances: [
        {
          asset: 'USDC',
          network: 'BASE',
          available_atomic: '1e+21',
          reserved_atomic: '0',
          pending_atomic: '0',
          restricted_atomic: '0',
        },
      ],
    }),
    respond({ initialized_at: 42, balances: [] }),
    respond([]),
  ]) {
    const repository = new SupabaseFinancialRepository('https://db.test', 'service-key', fetchStub);
    await assert.rejects(
      () => read(repository),
      (error) => error.status === 503 && error.code === 'financial_storage_unavailable',
    );
  }
});
