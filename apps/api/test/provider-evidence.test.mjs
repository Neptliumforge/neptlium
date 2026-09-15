import assert from 'node:assert/strict';
import test from 'node:test';

import { providerEvidence } from '../dist/provider-evidence.js';

test('provider evidence is born non-canonical and unreconciled', () => {
  const evidence = providerEvidence({ provider: 'alchemy', kind: 'chain_observation', providerReference: '0xabc', observedAt: '2026-09-15T12:00:00.000Z', chainId: 'ethereum' });
  assert.equal(evidence.canonical, false);
  assert.equal(evidence.reconciled, false);
});

test('provider evidence requires auditable reference and timestamp', () => {
  assert.throws(() => providerEvidence({ provider: 'stripe', kind: 'payment_observation', providerReference: '', observedAt: '2026-09-15T12:00:00.000Z' }));
  assert.throws(() => providerEvidence({ provider: 'circle', kind: 'settlement_observation', providerReference: 'provider-id', observedAt: 'invalid' }));
});
