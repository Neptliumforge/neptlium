import assert from 'node:assert/strict';
import test from 'node:test';
import {
  executionEvidence,
  executionProviderId,
  isCanonicalFinancialTruth,
} from '../dist/execution/index.js';

const provider = executionProviderId('future-venue');

test('provider identity is normalized but does not carry financial authority', () => {
  assert.equal(provider, 'FUTURE-VENUE');
});

test('provider observations remain explicitly non-canonical', () => {
  const evidence = executionEvidence({
    id: 'evidence-1',
    provider,
    environment: 'TEST',
    source: 'REST_OBSERVATION',
    providerReference: 'provider-ref',
    observedAt: '2026-10-01T00:00:00.000Z',
    receivedAt: '2026-10-01T00:00:01.000Z',
    payloadDigest: 'sha256:fixture',
    payloadReference: null,
    schemaVersion: 1,
    providerNativeState: 'filled',
    providerNativeReason: 'venue_reason',
  });

  assert.equal(evidence.authority, 'PROVIDER_EVIDENCE');
  assert.equal(evidence.environment, 'TEST');
  assert.equal(evidence.providerNativeState, 'filled');
  assert.equal(evidence.providerNativeReason, 'venue_reason');
  assert.equal(isCanonicalFinancialTruth(evidence), false);
});

test('provider financial observations are named and tagged as observations', () => {
  const collateral = { observationKind: 'PROVIDER_COLLATERAL', asset: 'USD', total: '100', available: '80', marginUsed: '20' };
  const position = {
    observationKind: 'PROVIDER_POSITION',
    provider,
    environment: 'TEST',
    instrumentId: 'instrument-1',
    quantity: '1',
    entryPrice: '10',
    unrealizedPnl: '1',
    realizedPnl: null,
    observedAt: '2026-10-01T00:00:00.000Z',
    evidenceId: 'evidence-1',
  };
  const fill = {
    observationKind: 'PROVIDER_FILL',
    provider,
    environment: 'TEST',
    providerFillId: 'fill-1',
    orderId: 'order-1',
    providerOrderId: 'provider-order-1',
    instrumentId: 'instrument-1',
    quantity: '1',
    price: '10',
    feeAmount: '0.01',
    feeAsset: 'USD',
    occurredAt: '2026-10-01T00:00:00.000Z',
    evidenceId: 'evidence-1',
  };

  assert.equal(collateral.observationKind, 'PROVIDER_COLLATERAL');
  assert.equal(position.observationKind, 'PROVIDER_POSITION');
  assert.equal(fill.observationKind, 'PROVIDER_FILL');
  assert.notEqual(fill.observationKind, 'LEDGER_POSTING');
});
