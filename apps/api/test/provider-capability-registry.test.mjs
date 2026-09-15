import assert from 'node:assert/strict';
import test from 'node:test';

import { buildConfiguredProviderCapabilities } from '../dist/provider-capability-registry.js';

test('configuration creates only non-executable configured capabilities', () => {
  const capabilities = buildConfiguredProviderCapabilities({
    NODE_ENV: 'production',
    ALCHEMY_ETHEREUM_RPC_URL: 'https://eth-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_BASE_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key',
    CIRCLE_API_KEY: 'circle-key',
    CIRCLE_ENTITY_SECRET: 'circle-secret',
    CIRCLE_ENVIRONMENT: 'production',
    STRIPE_SECRET_KEY: 'stripe-key',
    STRIPE_WEBHOOK_SECRET: 'stripe-webhook',
  });

  assert.ok(capabilities.some((capability) => capability.provider === 'alchemy' && capability.chainId === 'ethereum'));
  assert.ok(capabilities.some((capability) => capability.provider === 'circle' && capability.operation === 'stablecoin_withdrawal'));
  assert.ok(capabilities.some((capability) => capability.provider === 'stripe' && capability.operation === 'billing'));
  assert.ok(capabilities.every((capability) => capability.state === 'configured'));
  assert.ok(capabilities.every((capability) => capability.executionEnabled === false));
});
