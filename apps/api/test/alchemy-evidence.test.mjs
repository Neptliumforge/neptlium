import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BASE_MAINNET_USDC_CONTRACT,
  normalizeAlchemyObservation,
} from '../dist/alchemy-observer.js';

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
};

test('Alchemy Base evidence remains observation-only and requires receipt/log identity', () => {
  const evidence = normalizeAlchemyObservation(baseEvidence, 'LIVE');
  assert.equal(evidence.state, 'observed');
  assert.equal(evidence.source, 'ALCHEMY');
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
});
