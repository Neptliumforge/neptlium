import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyObservedTransaction, reconciliationKey } from '../dist/transaction-intelligence.js';

const wallet = '0x1111111111111111111111111111111111111111';
const counterparty = '0x2222222222222222222222222222222222222222';
const router = '0x3333333333333333333333333333333333333333';
const usdc = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const weth = '0x4200000000000000000000000000000000000006';
const txHash = `0x${'a'.repeat(64)}`;
const observedAt = '2026-09-14T15:30:00.000Z';

function leg(overrides = {}) {
  return {
    network: 'BASE',
    txHash,
    from: counterparty,
    to: wallet,
    asset: 'USDC',
    amountAtomic: '25000000',
    tokenContract: usdc,
    tokenDecimals: 6,
    logIndex: 3,
    observedAt,
    ...overrides,
  };
}

test('classifies a one-way inbound transfer as a deposit', () => {
  const result = classifyObservedTransaction({ walletAddress: wallet, legs: [leg()] });
  assert.equal(result.kind, 'deposit');
  assert.equal(result.confidence, 'high');
  assert.equal(result.canonical, false);
  assert.equal(result.legs[0].direction, 'in');
});

test('classifies a one-way outbound transfer as a withdrawal', () => {
  const result = classifyObservedTransaction({
    walletAddress: wallet,
    legs: [leg({ from: wallet, to: counterparty })],
  });
  assert.equal(result.kind, 'withdrawal');
  assert.equal(result.confidence, 'high');
  assert.equal(result.legs[0].direction, 'out');
});

test('classifies different outgoing and incoming assets as a probable swap', () => {
  const result = classifyObservedTransaction({
    walletAddress: wallet,
    legs: [
      leg({ from: wallet, to: router, asset: 'USDC', tokenContract: usdc, amountAtomic: '10000000', logIndex: 7 }),
      leg({ from: router, to: wallet, asset: 'WETH', tokenContract: weth, tokenDecimals: 18, amountAtomic: '3000000000000000', logIndex: 8 }),
    ],
  });
  assert.equal(result.kind, 'swap');
  assert.equal(result.confidence, 'medium');
  assert.deepEqual(result.legs.map((item) => item.direction), ['out', 'in']);
});

test('does not overstate same-asset bidirectional movement as a swap', () => {
  const result = classifyObservedTransaction({
    walletAddress: wallet,
    legs: [
      leg({ from: wallet, to: router, amountAtomic: '10000000', logIndex: 7 }),
      leg({ from: router, to: wallet, amountAtomic: '9000000', logIndex: 8 }),
    ],
  });
  assert.equal(result.kind, 'contract_interaction');
  assert.equal(result.confidence, 'low');
});

test('classifies an exact same-address movement as self transfer', () => {
  const result = classifyObservedTransaction({
    walletAddress: wallet,
    legs: [leg({ from: wallet, to: wallet })],
  });
  assert.equal(result.kind, 'self_transfer');
  assert.equal(result.confidence, 'high');
});

test('rejects unrelated evidence instead of attaching it to an investor wallet', () => {
  assert.throws(
    () => classifyObservedTransaction({
      walletAddress: wallet,
      legs: [leg({ from: counterparty, to: router })],
    }),
    /does not involve the wallet/,
  );
});

test('creates deterministic log-level reconciliation keys', () => {
  const first = reconciliationKey(leg());
  const second = reconciliationKey(leg({ txHash: txHash.toUpperCase().replace('0X', '0x') }));
  assert.equal(first, second);
  assert.match(first, /^BASE:0x[a-f0-9]{64}:3:BASE:/);
});
