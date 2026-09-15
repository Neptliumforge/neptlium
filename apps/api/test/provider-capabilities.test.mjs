import assert from 'node:assert/strict';
import test from 'node:test';

import { assertProviderCapability, capabilityCanExecute } from '../dist/provider-capabilities.js';

test('Alchemy may advertise observation without financial execution authority', () => {
  const capability = { provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'capability_certified', chainId: 'ethereum', executionEnabled: false };
  assert.doesNotThrow(() => assertProviderCapability(capability));
  assert.equal(capabilityCanExecute(capability), false);
  assert.throws(() => assertProviderCapability({ ...capability, executionEnabled: true }));
});

test('Circle stablecoin execution remains separately gated', () => {
  const configured = { provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', state: 'configured', assetOrCurrency: 'USDC', executionEnabled: true };
  assert.doesNotThrow(() => assertProviderCapability(configured));
  assert.equal(capabilityCanExecute(configured), false);
  assert.equal(capabilityCanExecute({ ...configured, state: 'capability_certified' }), true);
});

test('Stripe fiat capability cannot masquerade as blockchain capability', () => {
  assert.doesNotThrow(() => assertProviderCapability({ provider: 'stripe', operation: 'fiat_payment', environment: 'production', state: 'configured', assetOrCurrency: 'USD', executionEnabled: false }));
  assert.throws(() => assertProviderCapability({ provider: 'stripe', operation: 'observe_chain', environment: 'production', state: 'configured', chainId: 'base', executionEnabled: false }));
});
