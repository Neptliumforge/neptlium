import assert from 'node:assert/strict';
import test from 'node:test';
import { financialPrecision, governedAssetRegistry } from '../dist/asset-registry.js';
import { loadConfig } from '../dist/config.js';
import { handleFinancialRoute } from '../dist/financial-routes.js';
import { MemoryFinancialRepository } from '../dist/financial-repository.js';

const config = loadConfig({ NODE_ENV: 'test' });
const owner = 'precision-owner';
const context = (path) => ({ method: 'GET', path, query: new URLSearchParams(), headers: {}, rawBody: Buffer.alloc(0) });
const get = async (repository, path) => (await handleFinancialRoute(context(path), { config, repository, ownerId: async () => owner })).data;

function balance(asset, network, totalAtomic = '0') {
  return { asset, network, totalAtomic, availableAtomic: totalAtomic, reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' };
}

test('financial precision is registry-owned, network-specific, and unknown identities stay unknown', () => {
  for (const definition of governedAssetRegistry) {
    assert.deepEqual(financialPrecision(definition.asset, definition.network, definition.environment), {
      decimals: definition.atomicPrecision, atomicPrecision: definition.atomicPrecision,
    });
  }
  assert.deepEqual(financialPrecision('USD', null), { decimals: 2, atomicPrecision: 2 });
  assert.deepEqual(financialPrecision('USDC', 'BASE'), { decimals: 6, atomicPrecision: 6 });
  for (const [asset, network, environment] of [['USDC', null, 'LIVE'], ['BTC', 'BASE', 'LIVE'], ['UNKNOWN', 'BASE', 'LIVE'], ['USDC', 'BASE', 'TEST']]) {
    assert.deepEqual(financialPrecision(asset, network, environment), { decimals: null, atomicPrecision: null });
  }
});

test('canonical balances and allocation workspace expose authoritative precision without changing quantities', async () => {
  const repository = new MemoryFinancialRepository();
  const rows = [balance('USD', null), balance('USDC', 'BASE', '1234567'), balance('BTC', 'BITCOIN', '900719925474099312345'), balance('UNKNOWN', null)];
  repository.balancesByOwner.set(owner, rows);
  const result = await get(repository, '/v1/capital-account/balances');
  assert.equal(result.source, 'NEPTLIUM_CANONICAL_LEDGER');
  const workspace = await get(repository, '/v1/allocation/workspace');
  assert.equal(workspace.observed.portfolioValue, null);
  for (const [index, row] of rows.entries()) {
    const precision = financialPrecision(row.asset, row.network);
    const wire = result.balances[index];
    assert.equal(wire.total_atomic, row.totalAtomic);
    assert.equal(wire.reserved_atomic, '0');
    assert.equal(wire.decimals, precision.decimals);
    assert.equal(wire.atomicPrecision, precision.atomicPrecision);
    assert.deepEqual(workspace.observed.positions[index], { ...row, ...precision });
  }
});

test('funding and transfer detail and activity contracts preserve precision and null amounts', async () => {
  const repository = new MemoryFinancialRepository();
  for (const [index, definition] of governedAssetRegistry.entries()) {
    const network = definition.asset === 'USD' ? null : definition.network;
    const input = { id: `record-${index}`, ownerId: owner, asset: definition.asset, network, rail: definition.capabilityCode,
      amountAtomic: index === 0 ? null : '12345678901234567890', state: 'pending', environment: 'LIVE', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    // Seed local records only; no submission, execution gate, or provider is invoked.
    const funding = await repository.createFundingIntent({ ownerId: owner, asset: input.asset, ...(network ? { network } : {}), rail: input.rail,
      ...(input.amountAtomic === null ? {} : { amountAtomic: input.amountAtomic }), environment: 'LIVE', idempotencyKey: input.id, requestDigest: input.id });
    repository.transfers.set(input.id, { ...input, aliasId: 'test-alias', amountAtomic: '0', key: input.id, digest: input.id });
    const fundingDetail = await get(repository, `/v1/funding/intents/${funding.value.id}`);
    const transferDetail = await get(repository, `/v1/treasury/transfers/${input.id}`);
    assert.equal(fundingDetail.amount_atomic, input.amountAtomic);
    assert.equal(transferDetail.amount_atomic, '0');
    for (const row of [fundingDetail, transferDetail]) {
      assert.equal(row.decimals, definition.atomicPrecision);
      assert.equal(row.atomicPrecision, definition.atomicPrecision);
    }
  }
  for (const path of ['/v1/funding/activity', '/v1/treasury/transfers']) {
    const result = await get(repository, path);
    assert.equal(result.data.length, governedAssetRegistry.length);
    for (const row of result.data) {
      assert.equal(row.decimals, financialPrecision(row.asset, row.network).decimals);
      assert.equal(row.atomicPrecision, row.decimals);
    }
  }
});

test('funding and transfer capability precision does not open execution gates', async () => {
  const repository = new MemoryFinancialRepository();
  for (const path of ['/v1/funding/capabilities', '/v1/treasury/transfer-capabilities']) {
    const result = await get(repository, path);
    for (const row of result.capabilities) {
      assert.equal(row.decimals, financialPrecision(row.asset, row.network).decimals);
      assert.equal(row.atomicPrecision, row.decimals);
      assert.notEqual(row.state, 'ENABLED');
    }
  }
});

test('canonical Capital Account and Treasury summary projections retain precision', async () => {
  const { buildApp } = await import('../dist/app.js');
  const { MemoryRepository } = await import('../dist/repositories.js');
  const financialRepository = new MemoryFinancialRepository();
  financialRepository.balancesByOwner.set(owner, [balance('USDC', 'BASE', '1000001')]);
  financialRepository.transfers.set('transfer', { id: 'transfer', ownerId: owner, aliasId: 'alias', asset: 'USD', network: null,
    rail: 'USD_ACH', amountAtomic: '0', state: 'PENDING_APPROVAL', environment: 'LIVE', createdAt: '2026-01-01', updatedAt: '2026-01-01', key: 'key', digest: 'digest' });
  const app = await buildApp({ config, financialRepository, repository: new MemoryRepository(), authenticate: async () => ({ id: owner }) });
  const read = async (url) => {
    const response = await app.inject({ method: 'GET', url, headers: { authorization: 'Bearer test-token' } });
    assert.equal(response.statusCode, 200);
    return response.json();
  };
  const capital = await read('/v1/capital-account/state');
  for (const field of ['total', 'available', 'reserved', 'pending']) {
    const row = capital.canonical[field].value[0];
    assert.equal(row.decimals, 6);
    assert.equal(row.atomicPrecision, 6);
  }
  const treasury = await read('/v1/customer/treasury');
  for (const field of ['available_liquidity', 'reserved']) {
    assert.equal(treasury[field].value[0].decimals, 6);
    assert.equal(treasury[field].value[0].atomicPrecision, 6);
  }
  assert.equal(treasury.transfers.value[0].decimals, 2);
  assert.equal(treasury.transfers.value[0].atomicPrecision, 2);
  assert.equal(treasury.transfers.value[0].amount_atomic, '0');
});
