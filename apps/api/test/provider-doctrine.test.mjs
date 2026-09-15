import assert from 'node:assert/strict';
import test from 'node:test';

import { providerAuthorityInvariants, providerDoctrine, requirePrimaryProvider } from '../dist/provider-doctrine.js';

test('primary provider responsibilities remain separated from Neptlium financial authority', () => {
  assert.equal(providerDoctrine.circle.role, 'digital_money_settlement');
  assert.equal(providerDoctrine.alchemy.role, 'multichain_observation_intelligence');
  assert.equal(providerDoctrine.stripe.role, 'fiat_payment_infrastructure');

  for (const provider of Object.values(providerDoctrine)) {
    assert.ok(provider.forbiddenAuthority.includes('canonical_balance'));
    assert.ok(provider.forbiddenAuthority.includes('canonical_ledger'));
    assert.ok(provider.forbiddenAuthority.includes('reconciliation'));
  }
});

test('financial truth distinctions are encoded as invariants', () => {
  assert.deepEqual(providerAuthorityInvariants, {
    providerObservationIsCanonicalLedger: false,
    configuredMeansLiveCapability: false,
    capabilityMeansExecutionAuthorized: false,
    submittedMeansSettled: false,
    settledMeansReconciled: false,
  });
});

test('only canonical primary providers are accepted', () => {
  assert.equal(requirePrimaryProvider('circle'), 'circle');
  assert.equal(requirePrimaryProvider('alchemy'), 'alchemy');
  assert.equal(requirePrimaryProvider('stripe'), 'stripe');
  assert.throws(() => requirePrimaryProvider('unknown'));
});
