import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAllocationRoute } from '../dist/allocation-routes.js';
import { MemoryAllocationRepository } from '../dist/allocation-repository.js';
import { MemoryFinancialRepository } from '../dist/financial-repository.js';

const ownerId = '00000000-0000-4000-8000-000000000001';
const policyInput = {
  name: 'Idempotent policy', objective: 'Prove safe retries', reviewFrequency: 'MANUAL', reserveRequirementBps: 10000, driftToleranceBps: 500,
  allowedAssets: [{ asset: 'USDC', network: 'BASE' }], restrictedAssets: [], liquidityConstraints: {},
  targets: [{ key: 'usdc', basis: 'ASSET', asset: 'USDC', network: 'BASE', targetBps: 10000 }],
};
const ctx = (method, path, body, key) => ({ method, path, query: new URLSearchParams(), body, rawBody: Buffer.alloc(0), headers: { 'idempotency-key': key } });

test('repeating model creation with the same command key replays the original canonical snapshot', async () => {
  const repository = new MemoryAllocationRepository();
  const financialRepository = new MemoryFinancialRepository();
  financialRepository.balancesByOwner.set(ownerId, [{ asset: 'USDC', network: 'BASE', totalAtomic: '1000000', availableAtomic: '1000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' }]);
  const deps = { repository, financialRepository, principal: async () => ({ id: ownerId }) };
  const policyResponse = await handleAllocationRoute(ctx('POST', '/v1/allocation/policies', policyInput, 'policy-idem-stable'), deps);
  const policyId = policyResponse.data.policy.id;
  const first = await handleAllocationRoute(ctx('POST', '/v1/allocation/models', { policyId }, 'model-idem-stable'), deps);
  await new Promise((resolve) => setTimeout(resolve, 2));
  financialRepository.balancesByOwner.set(ownerId, [{ asset: 'USDC', network: 'BASE', totalAtomic: '2000000', availableAtomic: '2000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' }]);
  const replay = await handleAllocationRoute(ctx('POST', '/v1/allocation/models', { policyId }, 'model-idem-stable'), deps);
  assert.equal(replay.data.replayed, true);
  assert.equal(replay.data.model.id, first.data.model.id);
  assert.equal(replay.data.model.observedAt, first.data.model.observedAt);
  assert.equal(replay.data.model.observed[0].totalAtomic, '1000000');
});
