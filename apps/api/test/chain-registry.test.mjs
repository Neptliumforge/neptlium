import assert from 'node:assert/strict';
import test from 'node:test';

import { chainRegistry, getChainDefinition, listAlchemyProductionChains } from '../dist/chain-registry.js';

test('canonical production registry contains the initial multi-chain Alchemy surface', () => {
  assert.equal(chainRegistry.ethereum.chainId, 1);
  assert.equal(chainRegistry.base.chainId, 8453);
  assert.equal(chainRegistry.arbitrum.chainId, 42161);
  assert.equal(chainRegistry.optimism.chainId, 10);
  assert.equal(chainRegistry.polygon.chainId, 137);
  assert.equal(listAlchemyProductionChains().length, 5);
});

test('chain lookup fails closed for unsupported networks', () => {
  assert.equal(getChainDefinition('ethereum').displayName, 'Ethereum');
  assert.throws(() => getChainDefinition('unsupported-chain'));
});
