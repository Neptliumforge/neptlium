import assert from 'node:assert/strict';
import test from 'node:test';
import { MemoryTransactionIntelligenceRepository } from '../dist/transaction-intelligence-repository.js';
import { TransactionIntelligenceService, transactionObservationDigest, transactionObservationIdentity } from '../dist/transaction-intelligence-service.js';

const ownerId = '11111111-1111-4111-8111-111111111111';
const wallet = '0x1111111111111111111111111111111111111111';
const router = '0x3333333333333333333333333333333333333333';
const usdc = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const weth = '0x4200000000000000000000000000000000000006';
const txHash = `0x${'d'.repeat(64)}`;
const observedAt = '2026-09-14T15:50:00.000Z';

const observedLegs = () => [
  { network: 'BASE', txHash, from: wallet, to: router, asset: 'USDC', amountAtomic: '10000000', tokenContract: usdc, tokenDecimals: 6, logIndex: 7, observedAt },
  { network: 'BASE', txHash, from: router, to: wallet, asset: 'WETH', amountAtomic: '3000000000000000', tokenContract: weth, tokenDecimals: 18, logIndex: 8, observedAt },
];

test('observation identity and digest are stable across leg order', () => {
  const normal = observedLegs();
  const reversed = [...normal].reverse();
  assert.equal(transactionObservationIdentity({ walletAddress: wallet, legs: normal }), transactionObservationIdentity({ walletAddress: wallet, legs: reversed }));
  assert.equal(transactionObservationDigest({ walletAddress: wallet, legs: normal }), transactionObservationDigest({ walletAddress: wallet, legs: reversed }));
});

test('service persists a semantic event once and recognizes replay', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const service = new TransactionIntelligenceService(repo);
  const input = { ownerId, walletAddress: wallet, source: 'ALCHEMY', sourceEventId: 'alchemy-swap-1', legs: observedLegs() };
  const first = await service.ingest(input);
  const replay = await service.ingest({ ...input, legs: [...observedLegs()].reverse() });
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(first.event.id, replay.event.id);
  assert.equal(first.event.kind, 'swap');
  assert.equal(first.event.canonical, false);
  assert.equal(repo.observations.size, 1);
  assert.equal(repo.events.size, 1);
});

test('same source event id with changed payload is rejected', async () => {
  const repo = new MemoryTransactionIntelligenceRepository();
  const service = new TransactionIntelligenceService(repo);
  const input = { ownerId, walletAddress: wallet, source: 'ALCHEMY', sourceEventId: 'alchemy-swap-2', legs: observedLegs() };
  await service.ingest(input);
  const changed = observedLegs();
  changed[0] = { ...changed[0], amountAtomic: '9999999' };
  await assert.rejects(() => service.ingest({ ...input, legs: changed }), (error) => error?.code === 'observation_idempotency_conflict');
});
