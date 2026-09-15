import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizedProviderError } from '../dist/provider-error.js';

test('ambiguous provider errors retain ambiguity for controlled recovery', () => {
  const error = normalizedProviderError({ provider: 'circle', kind: 'ambiguous_outcome', retryable: false, ambiguous: true, safeMessage: 'Provider outcome requires lookup' });
  assert.equal(error.ambiguous, true);
});

test('ambiguous error cannot be normalized as definite', () => {
  assert.throws(() => normalizedProviderError({ provider: 'stripe', kind: 'ambiguous_outcome', retryable: true, ambiguous: false, safeMessage: 'Timeout' }));
});
