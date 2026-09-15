import assert from 'node:assert/strict';
import test from 'node:test';

import { projectProviderStatus } from '../dist/provider-status.js';

test('configured provider is not reported as certified or executable', () => {
  const status = projectProviderStatus('circle', [{ provider: 'circle', operation: 'stablecoin_withdrawal', environment: 'production', state: 'configured', executionEnabled: false }]);
  assert.equal(status.configured, true);
  assert.equal(status.highestCapabilityState, 'configured');
  assert.equal(status.executionCapabilityCount, 0);
});

test('Alchemy status counts certified observation separately from execution', () => {
  const status = projectProviderStatus('alchemy', [{ provider: 'alchemy', operation: 'observe_chain', environment: 'production', state: 'capability_certified', chainId: 'ethereum', executionEnabled: false }]);
  assert.equal(status.observationCapabilityCount, 1);
  assert.equal(status.executionCapabilityCount, 0);
});
