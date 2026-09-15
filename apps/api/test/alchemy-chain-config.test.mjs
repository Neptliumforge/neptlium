import assert from 'node:assert/strict';
import test from 'node:test';

import { alchemyRpcEnvironmentKey, loadAlchemyChainEndpoints } from '../dist/alchemy-chain-config.js';

test('loads independently configured Alchemy production chains', () => {
  const endpoints = loadAlchemyChainEndpoints({
    ALCHEMY_ETHEREUM_RPC_URL: 'https://eth-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_BASE_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_ARBITRUM_RPC_URL: 'https://arb-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_OPTIMISM_RPC_URL: 'https://opt-mainnet.g.alchemy.com/v2/key',
    ALCHEMY_POLYGON_RPC_URL: 'https://polygon-mainnet.g.alchemy.com/v2/key',
  });

  assert.deepEqual(Object.keys(endpoints), ['ethereum', 'base', 'arbitrum', 'optimism', 'polygon']);
  assert.equal(alchemyRpcEnvironmentKey('ethereum'), 'ALCHEMY_ETHEREUM_RPC_URL');
});

test('rejects a network endpoint assigned to the wrong chain', () => {
  assert.throws(() => loadAlchemyChainEndpoints({ ALCHEMY_ETHEREUM_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key' }));
});

test('allows partial observation configuration without implying capability', () => {
  const endpoints = loadAlchemyChainEndpoints({ ALCHEMY_BASE_RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/key' });
  assert.deepEqual(Object.keys(endpoints), ['base']);
});
