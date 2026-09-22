import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyObservedTransaction, reconciliationKey } from '../dist/transaction-intelligence.js';
import { MemoryTransactionIntelligenceRepository } from '../dist/transaction-intelligence-repository.js';

const ownerId = '11111111-1111-4111-8111-111111111111';
const wallet = '0x1111111111111111111111111111111111111111';
const counterparty = '0x2222222222222222222222222222222222222222';
const usdc = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const txHash = `0x${'b'.repeat(64)}`;
const observedAt = '2026-09-14T15:40:00.000Z';

function leg() {
  return {
    network: 'BASE',
    txHash,
    from: counterparty,
    to: wallet,
    asset: 'USDC',
    amountAtomic: '42000000',
    tokenContract: usdc,
    tokenDecimals: 6,
    logIndex: 12,
    observedAt,
  };
}

function observationInput(overrides = {}) {
  const transfer = leg();
  return {
    ownerId,
    walletAddress: wallet,
    network: 'BASE',
    txHash,
    source: 'ALCHEMY',
    sourceEventId: 'alchemy:event:123',
    reconciliationKey: reconciliationKey(transfer),
    payloadDigest: 'sha256:abc123',
    observedAt,
    ...overrides,
  };
}

test('observation ingestion is idempotent for identical provider evidence', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const first = await repo.ingestObservation(observationInput());
  const replay = await repo.ingestObservation(observationInput());

  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(replay.value.id, first.value.id);
  assert.equal(repo.observations.size, 1);
});

test('provider event identity cannot be reused with different evidence', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  await repo.ingestObservation(observationInput());

  await assert.rejects(
    () => repo.ingestObservation(observationInput({ payloadDigest: 'sha256:different' })),
    (error) => error?.code === 'observation_idempotency_conflict',
  );
});

test('classification persists exactly once and is permanently non-canonical', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const observed = await repo.ingestObservation(observationInput());
  const intelligence = classifyObservedTransaction({ walletAddress: wallet, legs: [leg()] });

  const first = await repo.persistClassification({
    observationId: observed.value.id,
    ownerId,
    intelligence,
  });
  const replay = await repo.persistClassification({
    observationId: observed.value.id,
    ownerId,
    intelligence,
  });

  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(first.value.canonical, false);
  assert.equal(first.value.kind, 'deposit');
  assert.equal(first.value.reconciliationState, 'classified');
  assert.equal(repo.events.size, 1);
});

test('activity is owner-scoped and newest observation appears first', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const firstObserved = await repo.ingestObservation(observationInput());
  const firstIntelligence = classifyObservedTransaction({ walletAddress: wallet, legs: [leg()] });
  await repo.persistClassification({ observationId: firstObserved.value.id, ownerId, intelligence: firstIntelligence });

  const laterTime = '2026-09-14T16:40:00.000Z';
  const laterHash = `0x${'c'.repeat(64)}`;
  const laterLeg = { ...leg(), txHash: laterHash, observedAt: laterTime, logIndex: 13 };
  const laterObserved = await repo.ingestObservation(observationInput({
    txHash: laterHash,
    sourceEventId: 'alchemy:event:124',
    reconciliationKey: reconciliationKey(laterLeg),
    payloadDigest: 'sha256:def456',
    observedAt: laterTime,
  }));
  const laterIntelligence = classifyObservedTransaction({ walletAddress: wallet, legs: [laterLeg] });
  await repo.persistClassification({ observationId: laterObserved.value.id, ownerId, intelligence: laterIntelligence });

  const activity = await repo.listActivity(ownerId, 20);
  assert.equal(activity.length, 2);
  assert.equal(activity[0].txHash, laterHash);
  assert.equal((await repo.listActivity('22222222-2222-4222-8222-222222222222', 20)).length, 0);
});

test('reconciliation state can be reviewed without changing canonical financial authority', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const observed = await repo.ingestObservation(observationInput());
  const intelligence = classifyObservedTransaction({ walletAddress: wallet, legs: [leg()] });
  const classified = await repo.persistClassification({ observationId: observed.value.id, ownerId, intelligence });

  const matched = await repo.updateReconciliationState({ ownerId, eventId: classified.value.id, state: 'matched' });
  assert.equal(matched.reconciliationState, 'matched');
  assert.equal(matched.canonical, false);
});
