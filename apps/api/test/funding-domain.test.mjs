import test from 'node:test';
import assert from 'node:assert/strict';
import {
  transitionFunding,
  transitionTransfer,
  reconcileEvidence,
  canCreditAvailable,
  evaluateOmnibusBacking,
  assertLiveExecutionGate,
} from '../dist/funding-domain.js';

test('provider confirmation cannot skip ledger and reconciliation', () => {
  assert.equal(transitionFunding('PROVIDER_CONFIRMED', 'LEDGER_POSTED'), 'LEDGER_POSTED');
  assert.throws(() => transitionFunding('PROVIDER_CONFIRMED', 'AVAILABLE'));
  assert.equal(canCreditAvailable('PROVIDER_CONFIRMED', 'MATCHED'), false);
  assert.equal(canCreditAvailable('RECONCILED', 'MATCHED'), true);
});

test('transfer cannot submit before durable reservation', () => {
  assert.equal(transitionTransfer('AUTHORIZED', 'RESERVED'), 'RESERVED');
  assert.throws(() => transitionTransfer('AUTHORIZED', 'SUBMITTED'));
});

test('one omnibus treasury asset position can back multiple customer claims', () => {
  const backed = evaluateOmnibusBacking('1000000000', ['200000000', '300000000', '500000000']);
  assert.deepEqual(backed, {
    treasuryAtomic: '1000000000',
    customerClaimsAtomic: '1000000000',
    state: 'BACKED',
  });
  assert.equal(evaluateOmnibusBacking('1000000000', ['200000000', '300000000', '500000001']).state, 'SHORTFALL');
});

test('reconciliation preserves mismatches rather than choosing a provider', () => {
  const result = reconcileEvidence(
    { asset: 'USDC', amountAtomic: '1000000', network: 'BASE', destination: '0xabc' },
    [
      { source: 'CIRCLE', environment: 'LIVE', asset: 'USDC', amountAtomic: '1000000', network: 'BASE', address: '0xabc', txHash: '0x1', state: 'confirmed' },
      { source: 'ALCHEMY', environment: 'LIVE', asset: 'USDC', amountAtomic: '999999', network: 'BASE', address: '0xabc', txHash: '0x1', state: 'confirmed' },
    ],
  );
  assert.equal(result.state, 'DISCREPANCY');
  assert.ok(result.discrepancyCodes.includes('AMOUNT_MISMATCH'));
});

test('live execution fails closed without verified capability and explicit enablement', () => {
  assert.throws(() => assertLiveExecutionGate({ environment: 'LIVE', capability: 'NOT_CONFIGURED', explicitlyEnabled: false }));
  assert.throws(() => assertLiveExecutionGate({ environment: 'LIVE', capability: 'ENABLED', explicitlyEnabled: false }));
  assert.doesNotThrow(() => assertLiveExecutionGate({ environment: 'LIVE', capability: 'ENABLED', explicitlyEnabled: true }));
});
