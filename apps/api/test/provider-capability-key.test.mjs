import assert from 'node:assert/strict';
import test from 'node:test';

import { providerCapabilityKey } from '../dist/provider-capability-key.js';

test('provider capability identity is deterministic and asset-normalized', () => {
  assert.equal(providerCapabilityKey({ provider: 'circle', environment: 'production', operation: 'stablecoin_withdrawal', chainId: 'ethereum', assetOrCurrency: 'usdc' }), 'circle:production:stablecoin_withdrawal:ethereum:USDC');
  assert.equal(providerCapabilityKey({ provider: 'alchemy', environment: 'production', operation: 'observe_chain', chainId: 'base' }), 'alchemy:production:observe_chain:base:-');
});
