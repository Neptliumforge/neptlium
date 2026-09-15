import assert from 'node:assert/strict';
import test from 'node:test';

import { providerCapabilityReadyForExecution, providerCapabilityReadyForObservation } from '../dist/provider-readiness.js';

test('certified Alchemy observation can be ready without execution', () => {
  const readiness = { capability: { provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'capability_certified', chainId: 'ethereum', executionEnabled: false }, passedGates: new Set(['P0_ARCHITECTURE', 'P1_CONFIGURATION', 'P2_CONNECTIVITY', 'P3_EVIDENCE_INGRESS', 'P4_CAPABILITY_CERTIFICATION']) };
  assert.equal(providerCapabilityReadyForObservation(readiness), true);
  assert.equal(providerCapabilityReadyForExecution(readiness), false);
});

test('economic execution additionally requires the execution gate', () => {
  const capability = { provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', state: 'capability_certified', chainId: 'ethereum', assetOrCurrency: 'USDC', executionEnabled: true };
  assert.equal(providerCapabilityReadyForExecution({ capability, passedGates: new Set(['P4_CAPABILITY_CERTIFICATION']) }), false);
  assert.equal(providerCapabilityReadyForExecution({ capability, passedGates: new Set(['P4_CAPABILITY_CERTIFICATION', 'P5_EXECUTION_AUTHORIZATION']) }), true);
});
