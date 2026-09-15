import test from 'node:test';
import assert from 'node:assert/strict';
import { providerEvidence } from '../dist/provider-evidence.js';

test('provider evidence is always non-canonical', () => {
  const evidence = providerEvidence({
    provider: 'ALCHEMY',
    providerReference: '0xabc',
    observedAt: '2026-09-15T00:00:00.000Z',
    networkOrRail: 'ethereum',
    payload: { confirmations: 12 },
  });
  assert.equal(evidence.canonical, false);
  assert.equal(evidence.provider, 'ALCHEMY');
});

test('provider evidence rejects missing reference and invalid timestamps', () => {
  assert.throws(() => providerEvidence({ provider: 'CIRCLE', providerReference: ' ', observedAt: '2026-09-15T00:00:00.000Z', payload: {} }));
  assert.throws(() => providerEvidence({ provider: 'STRIPE', providerReference: 'evt_1', observedAt: 'not-a-date', payload: {} }));
});
