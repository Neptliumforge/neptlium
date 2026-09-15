import assert from 'node:assert/strict';
import test from 'node:test';

import { providerIsOperational, validateProviderHealth } from '../dist/provider-health.js';

test('health expresses reachability without financial authority', () => {
  const health = { provider: 'alchemy', state: 'healthy', checkedAt: '2026-09-15T12:00:00.000Z', latencyMs: 42 };
  assert.doesNotThrow(() => validateProviderHealth(health));
  assert.equal(providerIsOperational(health), true);
});

test('unavailable provider is not operational', () => {
  assert.equal(providerIsOperational({ provider: 'circle', state: 'unavailable', checkedAt: '2026-09-15T12:00:00.000Z' }), false);
});
