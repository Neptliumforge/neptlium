import assert from 'node:assert/strict';
import test from 'node:test';

import { validateProviderCapabilityScope } from '../dist/provider-capability-scope.js';

test('chain observation capability requires canonical chain identity', () => {
  assert.doesNotThrow(() => validateProviderCapabilityScope({ provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'configured', chainId: 'ethereum', executionEnabled: false }));
  assert.throws(() => validateProviderCapabilityScope({ provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'configured', executionEnabled: false }));
});

test('economic capability requires explicit asset or currency identity', () => {
  assert.throws(() => validateProviderCapabilityScope({ provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', state: 'configured', executionEnabled: false }));
  assert.throws(() => validateProviderCapabilityScope({ provider: 'stripe', operation: 'fiat_payment', environment: 'production', state: 'configured', executionEnabled: false }));
});
