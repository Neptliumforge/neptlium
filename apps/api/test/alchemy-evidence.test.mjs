import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BASE_MAINNET_USDC_CONTRACT,
  normalizeAlchemyObservation,
} from '../dist/alchemy-observer.js';
import { SupabaseFinancialOperations } from '../dist/financial-operations.js';

const baseEvidence = {
  chainId: 8453,
  txHash: `0x${'1'.repeat(64)}`,
  asset: 'USDC',
  network: 'BASE',
  from: `0x${'2'.repeat(40)}`,
  to: `0x${'3'.repeat(40)}`,
  amountAtomic: '1000000',
  receiptPresent: true,
  receiptStatus: 'SUCCESS',
  blockNumber: '0x10',
  blockHash: `0x${'4'.repeat(64)}`,
  confirmations: 12,
  transferType: 'ERC20',
  tokenContract: BASE_MAINNET_USDC_CONTRACT,
  tokenDecimals: 6,
  logIndex: 0,
  observedAt: '2026-08-19T12:00:00.000Z',
  treasuryDestinationId: 'destination-1',
  depositRouteId: 'route-1',
  fundingIntentId: 'funding-1',
};

test('Alchemy Base evidence remains observation-only and requires receipt/log identity', () => {
  const evidence = normalizeAlchemyObservation(baseEvidence, 'LIVE');
  assert.equal(evidence.state, 'observed');
  assert.equal(evidence.source, 'ALCHEMY');
  assert.equal(evidence.canonical, false);
  assert.deepEqual(
    {
      chainId: evidence.chainId,
      transactionHash: evidence.transactionHash,
      sender: evidence.sender,
      recipient: evidence.recipient,
      receiptStatus: evidence.receiptStatus,
      blockNumber: evidence.blockNumber,
      blockHash: evidence.blockHash,
      transferType: evidence.transferType,
      tokenContract: evidence.tokenContract,
      tokenDecimals: evidence.tokenDecimals,
      rawAtomicAmount: evidence.rawAtomicAmount,
      logIndex: evidence.logIndex,
      confirmations: evidence.confirmations,
      observedAt: evidence.observedAt,
      treasuryDestinationId: evidence.treasuryDestinationId,
      depositRouteId: evidence.depositRouteId,
      fundingIntentId: evidence.fundingIntentId,
    },
    {
      chainId: 8453,
      transactionHash: baseEvidence.txHash,
      sender: baseEvidence.from,
      recipient: baseEvidence.to,
      receiptStatus: 'SUCCESS',
      blockNumber: '0x10',
      blockHash: baseEvidence.blockHash,
      transferType: 'ERC20',
      tokenContract: BASE_MAINNET_USDC_CONTRACT,
      tokenDecimals: 6,
      rawAtomicAmount: '1000000',
      logIndex: 0,
      confirmations: 12,
      observedAt: baseEvidence.observedAt,
      treasuryDestinationId: 'destination-1',
      depositRouteId: 'route-1',
      fundingIntentId: 'funding-1',
    },
  );
});

test('Alchemy rejects wrong chain, failed receipt, and symbol-only fake USDC', () => {
  assert.throws(
    () => normalizeAlchemyObservation({ ...baseEvidence, chainId: 1 }, 'LIVE'),
    /chain mismatch/,
  );
  assert.throws(
    () => normalizeAlchemyObservation({ ...baseEvidence, receiptStatus: 'REVERTED' }, 'LIVE'),
    /successful transaction receipt/,
  );
  assert.throws(
    () =>
      normalizeAlchemyObservation(
        { ...baseEvidence, tokenContract: `0x${'5'.repeat(40)}` },
        'LIVE',
      ),
    /canonical Base USDC contract/,
  );
  assert.throws(
    () => normalizeAlchemyObservation({ ...baseEvidence, transferType: 'NATIVE' }, 'LIVE'),
    /cannot be classified as a native transfer/,
  );
  assert.throws(
    () => normalizeAlchemyObservation({ ...baseEvidence, depositRouteId: '' }, 'LIVE'),
    /governed route correlation/,
  );
});

test('complete Alchemy evidence persists through governed settlement evidence without ledger mutation', async () => {
  const evidence = normalizeAlchemyObservation(baseEvidence, 'LIVE');
  const calls = [];
  const operations = new SupabaseFinancialOperations(
    'https://example.supabase.co',
    'service-role',
    async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify([{ id: 'evidence-1' }]), { status: 201 });
    },
  );
  const result = await operations.recordSettlementEvidence({
    source: 'alchemy',
    environment: 'live',
    asset: evidence.asset,
    network: evidence.network,
    fundingIntentId: evidence.fundingIntentId,
    depositRouteId: evidence.depositRouteId,
    treasuryDestinationId: evidence.treasuryDestinationId,
    txHash: evidence.transactionHash,
    address: evidence.recipient,
    amountAtomic: evidence.rawAtomicAmount,
    blockNumber: evidence.blockNumber,
    confirmations: evidence.confirmations ?? undefined,
    evidenceState: 'observed',
    observedAt: evidence.observedAt,
    chainId: evidence.chainId,
    sender: evidence.sender,
    recipient: evidence.recipient,
    receiptStatus: evidence.receiptStatus,
    blockHash: evidence.blockHash,
    transferType: evidence.transferType,
    tokenContract: evidence.tokenContract,
    tokenDecimals: evidence.tokenDecimals,
    logIndex: evidence.logIndex,
    finalityState: evidence.finalityState,
    rawReference: evidence,
  });
  assert.deepEqual(result, { duplicate: false, id: 'evidence-1' });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /settlement_evidence$/);
  assert.doesNotMatch(calls[0].url, /ledger/);
  const stored = JSON.parse(calls[0].init.body);
  assert.equal(stored.deposit_route_id, 'route-1');
  assert.equal(stored.treasury_destination_id, 'destination-1');
  assert.equal(stored.funding_intent_id, 'funding-1');
  assert.equal(stored.log_index, 0);
  assert.equal(stored.receipt_status, 'SUCCESS');
  assert.equal(stored.raw_reference.canonical, false);
});
