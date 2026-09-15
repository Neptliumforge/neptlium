import assert from 'node:assert/strict';
import test from 'node:test';

import { providerOutcome } from '../dist/provider-outcome.js';

test('submitted provider operation remains unsettled and unreconciled', () => {
  const outcome = providerOutcome({ provider: 'circle', intentId: 'intent_1', submissionState: 'submitted', providerReference: 'provider_1', observedAt: '2026-09-15T12:00:00.000Z' });
  assert.equal(outcome.settled, false);
  assert.equal(outcome.reconciled, false);
});

test('ambiguous timeout can exist without inventing provider failure or reference', () => {
  const outcome = providerOutcome({ provider: 'stripe', intentId: 'intent_2', submissionState: 'ambiguous', observedAt: '2026-09-15T12:00:00.000Z' });
  assert.equal(outcome.submissionState, 'ambiguous');
  assert.equal(outcome.providerReference, undefined);
});

test('submitted outcome requires stable provider reference', () => {
  assert.throws(() => providerOutcome({ provider: 'stripe', intentId: 'intent_3', submissionState: 'submitted', observedAt: '2026-09-15T12:00:00.000Z' }));
});
