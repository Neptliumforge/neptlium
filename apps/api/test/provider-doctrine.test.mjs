import test from 'node:test';
import assert from 'node:assert/strict';
import { providerDoctrine, strategicProviders, capabilityAtLeast } from '../dist/provider-doctrine.js';
import { chainRegistry, requireChainDefinition } from '../dist/chain-registry.js';

test('strategic provider set is Circle Alchemy Stripe and none is financial authority', () => {
  assert.deepEqual(strategicProviders, ['CIRCLE', 'ALCHEMY', 'STRIPE']);
  assert.equal(providerDoctrine.CIRCLE.role, 'STABLECOIN_SETTLEMENT');
  assert.equal(providerDoctrine.ALCHEMY.role, 'CHAIN_INTELLIGENCE');
  assert.equal(providerDoctrine.STRIPE.role, 'FIAT_PAYMENTS');
  assert.equal(Object.values(providerDoctrine).every((provider) => provider.authoritative === false), true);
});

test('capability activation cannot infer execution from configuration', () => {
  assert.equal(capabilityAtLeast('CONFIGURED', 'EXECUTION_ENABLED'), false);
  assert.equal(capabilityAtLeast('CERTIFIED', 'EXECUTION_ENABLED'), false);
  assert.equal(capabilityAtLeast('EXECUTION_ENABLED', 'EXECUTION_ENABLED'), true);
});

test('canonical chain registry is multi-chain and observation-first', () => {
  assert.deepEqual(Object.keys(chainRegistry).sort(), ['arbitrum', 'base', 'ethereum', 'optimism', 'polygon']);
  for (const chain of Object.values(chainRegistry)) {
    assert.equal(chain.strategicInfrastructureProvider, 'ALCHEMY');
    assert.equal(chain.capabilities.deposits, 'disabled');
    assert.equal(chain.capabilities.withdrawals, 'disabled');
    assert.equal(chain.capabilities.contract_execution, 'disabled');
  }
  assert.equal(requireChainDefinition('ethereum').chainId, 1);
  assert.throws(() => requireChainDefinition('unknown-chain'));
});
