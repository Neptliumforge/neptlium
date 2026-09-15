import assert from 'node:assert/strict';
import test from 'node:test';

import { validateProviderCorrelation } from '../dist/provider-correlation.js';

test('provider correlation requires Neptlium correlation and intent identity', () => {
  assert.doesNotThrow(() => validateProviderCorrelation({ correlationId: 'corr_1', intentId: 'intent_1', provider: 'stripe', providerReference: 'pi_1' }));
  assert.throws(() => validateProviderCorrelation({ correlationId: '', intentId: 'intent_1', provider: 'stripe' }));
  assert.throws(() => validateProviderCorrelation({ correlationId: 'corr_1', intentId: '', provider: 'stripe' }));
});
