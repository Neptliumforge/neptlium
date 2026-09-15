import assert from 'node:assert/strict';
import test from 'node:test';

import { chainRegistry, providerDoctrine, providerAuthorityInvariants } from '../dist/provider-architecture.js';

test('canonical provider architecture exports doctrine and chain registry', () => {
  assert.equal(providerDoctrine.circle.role, 'digital_money_settlement');
  assert.equal(providerDoctrine.alchemy.role, 'multichain_observation_intelligence');
  assert.equal(providerDoctrine.stripe.role, 'fiat_payment_infrastructure');
  assert.equal(chainRegistry.ethereum.chainId, 1);
  assert.equal(providerAuthorityInvariants.configuredMeansLiveCapability, false);
});
