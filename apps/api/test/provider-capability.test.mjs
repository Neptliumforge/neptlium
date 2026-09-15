import test from 'node:test';
import assert from 'node:assert/strict';
import { providerExecutionDecision } from '../dist/provider-capability.js';

for (const state of ['DECLARED', 'CONFIGURED', 'CONNECTED', 'OBSERVED', 'CERTIFIED', 'ELIGIBLE', 'AUTHORIZED']) {
  test(`${state} provider capability does not authorize execution`, () => {
    const decision = providerExecutionDecision({ provider: 'CIRCLE', operation: 'transfer', environment: 'production', state });
    assert.deepEqual(decision, { allowed: false, reason: 'capability_not_execution_enabled' });
  });
}

test('execution-enabled provider capability passes only the provider capability gate', () => {
  assert.deepEqual(
    providerExecutionDecision({ provider: 'STRIPE', operation: 'payment', environment: 'production', state: 'EXECUTION_ENABLED' }),
    { allowed: true, reason: 'execution_enabled' },
  );
});
