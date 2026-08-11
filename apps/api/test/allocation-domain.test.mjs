import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allocationCapabilities,
  assertAllocationTransition,
  calculateAllocationDrift,
  derivePlanExecutionState,
  reconciliationState,
  validateAllocationPolicy,
} from '../dist/allocation-domain.js';
import { assertAllocationReservationWithinAvailable, resolveAllocationExecutionCapability } from '../dist/allocation-execution.js';

const basePolicy = {
  name: 'Governed capital',
  objective: 'Maintain user-defined capital classifications',
  reviewFrequency: 'MONTHLY',
  reserveRequirementBps: 2500,
  driftToleranceBps: 500,
  allowedAssets: [{ asset: 'BTC', network: 'BITCOIN' }, { asset: 'ETH', network: 'BASE' }, { asset: 'USDC', network: 'BASE' }],
  restrictedAssets: [],
  liquidityConstraints: {},
  targets: [
    { key: 'reserve', basis: 'CLASSIFICATION', classification: 'RESERVE', targetBps: 2500 },
    { key: 'core', basis: 'CLASSIFICATION', classification: 'CORE', targetBps: 4500 },
    { key: 'growth', basis: 'CLASSIFICATION', classification: 'GROWTH', targetBps: 2000 },
    { key: 'opportunity', basis: 'CLASSIFICATION', classification: 'OPPORTUNITY', targetBps: 1000 },
  ],
};

test('invalid allocation target totals are rejected', () => {
  assert.throws(() => validateAllocationPolicy({ ...basePolicy, targets: [{ ...basePolicy.targets[0], targetBps: 9000 }] }), /total exactly 10000/);
});

test('restricted assets cannot have a positive asset target', () => {
  assert.throws(() => validateAllocationPolicy({
    ...basePolicy,
    restrictedAssets: [{ asset: 'BTC', network: 'BITCOIN' }],
    targets: [{ key: 'btc', basis: 'ASSET', asset: 'BTC', network: 'BITCOIN', targetBps: 10000 }],
  }), /Restricted asset/);
});

test('unsupported assets and networks are rejected by governed registry', () => {
  assert.throws(() => validateAllocationPolicy({ ...basePolicy, allowedAssets: [{ asset: 'DOGE', network: 'DOGE' }] }), /Unsupported allocation asset/);
});

test('MODELED and AUTHORIZED cannot skip execution evidence states', () => {
  assert.throws(() => assertAllocationTransition('MODELED', 'EXECUTED'), /cannot transition/);
  assert.throws(() => assertAllocationTransition('AUTHORIZED', 'EXECUTED'), /cannot transition/);
  assert.throws(() => assertAllocationTransition('EXECUTED', 'RECONCILED'), /cannot transition/);
});

test('allocation execution capability defaults closed and provider configuration alone is insufficient', () => {
  assert.equal(allocationCapabilities.canExecute, false);
  assert.equal(allocationCapabilities.canReserve, false);
  assert.deepEqual(resolveAllocationExecutionCapability({ governedDomainEnabled: false, providerConfigured: true, providerEligible: true, executionEnabled: true }), { canReserve: false, canExecute: false });
  assert.equal(resolveAllocationExecutionCapability({ governedDomainEnabled: true, providerConfigured: true, providerEligible: false, executionEnabled: true }).canExecute, false);
});

test('allocation reservation cannot exceed canonical available capital', () => {
  assert.doesNotThrow(() => assertAllocationReservationWithinAvailable('100', '100'));
  assert.throws(() => assertAllocationReservationWithinAvailable('101', '100'), /exceeds canonical available/);
});

test('partial movement execution does not mark the entire plan executed', () => {
  const movements = [
    { state: 'SETTLED' }, { state: 'SETTLED' }, { state: 'FAILED' },
  ].map((value, index) => ({ id: String(index), type: 'TRANSFER', asset: 'USDC', network: 'BASE', fromClassification: null, toClassification: null, amountAtomic: '1', executable: true, reason: null, ...value }));
  assert.equal(derivePlanExecutionState(movements), 'PARTIALLY_EXECUTED');
});

test('provider settlement does not equal reconciliation and disagreement is discrepancy', () => {
  assert.throws(() => assertAllocationTransition('EXECUTED', 'RECONCILED'));
  assert.equal(reconciliationState({ amountAtomic: '100', asset: 'USDC', network: 'BASE' }, { amountAtomic: '99', asset: 'USDC', network: 'BASE' }), 'DISCREPANCY');
});

test('unknown cross-asset valuation produces valuation unavailable rather than a fabricated percentage', () => {
  const policy = { ...basePolicy, id: 'p', ownerId: 'o', status: 'AUTHORIZED', version: 1, createdBy: 'o', authorizedBy: 'o', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), authorizedAt: new Date().toISOString() };
  const result = calculateAllocationDrift([
    { asset: 'BTC', network: 'BITCOIN', totalAtomic: '100000000', availableAtomic: '100000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' },
    { asset: 'USDC', network: 'BASE', totalAtomic: '1000000', availableAtomic: '1000000', reservedAtomic: '0', pendingAtomic: '0', restrictedAtomic: '0' },
  ], policy);
  assert.equal(result.valuationState, 'REQUIRED_UNAVAILABLE');
  assert.equal(result.rows.every((row) => row.currentBps === null), true);
  assert.equal(result.rows.every((row) => row.status === 'VALUATION_UNAVAILABLE'), true);
});
