import assert from 'node:assert/strict';
import test from 'node:test';

import { providerExecutionPermitted } from '../dist/provider-policy.js';

const capability = { provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', state: 'capability_certified', chainId: 'ethereum', assetOrCurrency: 'USDC', executionEnabled: true };

test('certified provider execution still requires Neptlium authorization, policy and approvals', () => {
  assert.equal(providerExecutionPermitted({ capability, neptliumAuthorized: true, policySatisfied: true, approvalsSatisfied: true }), true);
  assert.equal(providerExecutionPermitted({ capability, neptliumAuthorized: false, policySatisfied: true, approvalsSatisfied: true }), false);
  assert.equal(providerExecutionPermitted({ capability, neptliumAuthorized: true, policySatisfied: false, approvalsSatisfied: true }), false);
  assert.equal(providerExecutionPermitted({ capability, neptliumAuthorized: true, policySatisfied: true, approvalsSatisfied: false }), false);
});
