import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAllocationRoute } from '../dist/allocation-routes.js';
import { MemoryAllocationRepository } from '../dist/allocation-repository.js';
import { MemoryFinancialRepository } from '../dist/financial-repository.js';

const ownerA = '00000000-0000-4000-8000-000000000001';
const ownerB = '00000000-0000-4000-8000-000000000002';
const policyInput = {
  name: 'Owner policy', objective: 'Govern user-defined allocation', reviewFrequency: 'MONTHLY', reserveRequirementBps: 2500, driftToleranceBps: 500,
  allowedAssets: [{ asset: 'BTC', network: 'BITCOIN' }, { asset: 'USDC', network: 'BASE' }], restrictedAssets: [], liquidityConstraints: {},
  targets: [
    { key: 'reserve', basis: 'CLASSIFICATION', classification: 'RESERVE', targetBps: 2500 },
    { key: 'core', basis: 'CLASSIFICATION', classification: 'CORE', targetBps: 7500 },
  ],
};
const context = (method, path, body = {}, key = 'allocation-idem-0001') => ({ method, path, query: new URLSearchParams(), body, rawBody: Buffer.alloc(0), headers: { 'idempotency-key': key } });

async function setup(ownerId = ownerA) {
  const repository = new MemoryAllocationRepository();
  const financialRepository = new MemoryFinancialRepository();
  financialRepository.balancesByOwner.set(ownerA, [
    { asset: 'BTC', network: 'BITCOIN', totalAtomic: '100000000', availableAtomic: '100000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' },
    { asset: 'USDC', network: 'BASE', totalAtomic: '1000000', availableAtomic: '1000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' },
  ]);
  const deps = { repository, financialRepository, principal: async () => ({ id: ownerId }) };
  return { repository, financialRepository, deps };
}

test('one owner cannot access another owners allocation policy', async () => {
  const { repository, financialRepository } = await setup();
  const created = await handleAllocationRoute(context('POST', '/v1/allocation/policies', policyInput), { repository, financialRepository, principal: async () => ({ id: ownerA }) });
  const policyId = created.data.policy.id;
  await assert.rejects(() => handleAllocationRoute(context('GET', `/v1/allocation/policies/${policyId}`), { repository, financialRepository, principal: async () => ({ id: ownerB }) }), /not found/i);
});

test('browser payload cannot manufacture plan execution and duplicate authorization is idempotent', async () => {
  const { repository, financialRepository, deps } = await setup();
  const created = await handleAllocationRoute(context('POST', '/v1/allocation/policies', policyInput, 'policy-create-001'), deps);
  const policy = created.data.policy;
  await handleAllocationRoute(context('POST', `/v1/allocation/policies/${policy.id}/authorize`, { expectedVersion: policy.version, state: 'EXECUTED' }, 'policy-auth-001'), deps);
  const modeled = await handleAllocationRoute(context('POST', '/v1/allocation/models', { policyId: policy.id, state: 'EXECUTED' }, 'model-create-001'), deps);
  const planCreated = await handleAllocationRoute(context('POST', '/v1/allocation/plans', { modelId: modeled.data.model.id, state: 'EXECUTED' }, 'plan-create-001'), deps);
  const first = await handleAllocationRoute(context('POST', `/v1/allocation/plans/${planCreated.data.plan.id}/authorize`, { state: 'EXECUTED' }, 'plan-auth-001'), deps);
  const second = await handleAllocationRoute(context('POST', `/v1/allocation/plans/${planCreated.data.plan.id}/authorize`, { state: 'RECONCILED' }, 'plan-auth-001'), deps);
  assert.equal(first.data.plan.state, 'AUTHORIZED');
  assert.equal(second.data.plan.state, 'AUTHORIZED');
  assert.equal(second.data.replayed, true);
  assert.equal(first.data.execution, 'UNAVAILABLE');
});

test('workspace uses canonical ledger quantities and never fabricates portfolio value', async () => {
  const { deps } = await setup();
  const workspace = await handleAllocationRoute(context('GET', '/v1/allocation/workspace'), deps);
  assert.equal(workspace.data.observed.source, 'NEPTLIUM_CANONICAL_LEDGER');
  assert.equal(workspace.data.observed.positions.length, 2);
  assert.equal(workspace.data.observed.portfolioValue, null);
  assert.equal(workspace.data.observed.valuationState, 'UNAVAILABLE');
  assert.equal(workspace.data.capabilities.canExecute, false);
});
