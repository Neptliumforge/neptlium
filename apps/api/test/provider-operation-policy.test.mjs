import assert from 'node:assert/strict';
import test from 'node:test';

import { providerSupportsOperation, requireProviderOperation } from '../dist/provider-operation-policy.js';

test('Circle owns stablecoin operations, Alchemy observation, Stripe fiat payments', () => {
  assert.equal(providerSupportsOperation('circle', 'stablecoin_withdrawal'), true);
  assert.equal(providerSupportsOperation('alchemy', 'observe_chain'), true);
  assert.equal(providerSupportsOperation('stripe', 'fiat_payment'), true);
});

test('cross-provider responsibility leakage fails closed', () => {
  assert.throws(() => requireProviderOperation('alchemy', 'stablecoin_withdrawal'));
  assert.throws(() => requireProviderOperation('stripe', 'observe_chain'));
  assert.throws(() => requireProviderOperation('circle', 'fiat_payment'));
});
