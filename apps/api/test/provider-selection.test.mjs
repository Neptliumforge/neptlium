import assert from 'node:assert/strict';
import test from 'node:test';

import { selectProviderCapability } from '../dist/provider-selection.js';

const alchemyEthereum = { provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'capability_certified', chainId: 'ethereum', executionEnabled: false };

test('selection requires certified capability', () => {
  assert.equal(selectProviderCapability({ operation: 'observe_chain', environment: 'production', chainId: 'ethereum', requireExecution: false }, [alchemyEthereum]).provider, 'alchemy');
  assert.throws(() => selectProviderCapability({ operation: 'observe_chain', environment: 'production', chainId: 'ethereum', requireExecution: false }, [{ ...alchemyEthereum, state: 'configured' }]));
});

test('observation capability cannot satisfy an execution request', () => {
  assert.throws(() => selectProviderCapability({ operation: 'observe_chain', environment: 'production', chainId: 'ethereum', requireExecution: true }, [alchemyEthereum]));
});

test('ambiguous provider resolution fails closed', () => {
  const stripeA = { provider: 'stripe', operation: 'fiat_payment', environment: 'production', state: 'capability_certified', assetOrCurrency: 'USD', executionEnabled: true };
  const stripeB = { ...stripeA };
  assert.throws(() => selectProviderCapability({ operation: 'fiat_payment', environment: 'production', assetOrCurrency: 'USD', requireExecution: true }, [stripeA, stripeB]));
});
