import assert from 'node:assert/strict';
import test from 'node:test';
import { capitalBalanceView, formatReportingMinor } from '../components/product/capital-balance.ts';

const zeroReporting = { currency: 'USD', decimals: 2, total_minor: '0', valuation: 'ZERO_LEDGER' };
const ready = (data) => ({ state: 'READY', data });
const response = (overrides = {}) => ({
  contract_version: 2,
  source: 'NEPTLIUM_CANONICAL_LEDGER',
  balances: [],
  ...overrides,
});
const usdc = (overrides = {}) => ({
  asset: 'USDC',
  network: 'BASE',
  decimals: 6,
  atomic_precision: 6,
  total_atomic: '0',
  available_atomic: '0',
  reserved_atomic: '0',
  pending_atomic: '0',
  restricted_atomic: '0',
  ...overrides,
});

test('an initialized zero ledger is displayed as $0.00', () => {
  assert.deepEqual(
    capitalBalanceView(ready(response({ state: 'ZERO', reporting: zeroReporting }))),
    { kind: 'ZERO', display: '$0.00' },
  );
  assert.deepEqual(
    capitalBalanceView(
      ready(response({ state: 'ZERO', reporting: zeroReporting, balances: [usdc()] })),
    ),
    { kind: 'ZERO', display: '$0.00' },
  );
});

test('a failed or unavailable balance read is never zero', () => {
  assert.deepEqual(
    capitalBalanceView({ state: 'UNAVAILABLE', reason: 'canonical_balances_unavailable' }),
    { kind: 'UNAVAILABLE' },
  );
});

test('an uninitialized account and the version 1 EMPTY shape are not zero', () => {
  assert.deepEqual(capitalBalanceView(ready(response({ state: 'NOT_INITIALIZED' }))), {
    kind: 'NOT_INITIALIZED',
  });
  assert.deepEqual(
    capitalBalanceView(
      ready({ state: 'EMPTY', source: 'NEPTLIUM_CANONICAL_LEDGER', balances: [] }),
    ),
    { kind: 'NOT_INITIALIZED' },
  );
});

test('an inconsistent or unrecognised zero claim fails closed', () => {
  for (const data of [
    { state: 'ZERO', source: 'NEPTLIUM_CANONICAL_LEDGER', balances: [], reporting: zeroReporting },
    response({ state: 'ZERO' }),
    response({ state: 'ZERO', reporting: { ...zeroReporting, valuation: 'UNAVAILABLE' } }),
    response({ state: 'ZERO', reporting: { ...zeroReporting, total_minor: null } }),
    response({
      state: 'ZERO',
      reporting: zeroReporting,
      balances: [usdc({ available_atomic: '1', total_atomic: '1' })],
    }),
    response({ state: 'ZERO', reporting: { ...zeroReporting, currency: 'usd' } }),
    response({ state: 'NOT_INITIALIZED', balances: [usdc()] }),
    response({ state: 'VALUE' }),
    response({ state: 'SOMETHING_NEW' }),
  ]) {
    assert.deepEqual(
      capitalBalanceView(ready(data)),
      { kind: 'UNAVAILABLE' },
      JSON.stringify(data),
    );
  }
});

test('non-zero balances keep per-asset values and never produce a USD total', () => {
  const single = usdc({ total_atomic: '1500000', available_atomic: '1500000' });
  assert.deepEqual(capitalBalanceView(ready(response({ state: 'VALUE', balances: [single] }))), {
    kind: 'SINGLE',
    balance: single,
  });
  const view = capitalBalanceView(
    ready(response({ state: 'VALUE', balances: [single, usdc({ asset: 'ETH', decimals: 18 })] })),
  );
  assert.equal(view.kind, 'MULTIPLE');
  assert.equal('display' in view, false);
});

test('reporting minor units format exactly', () => {
  assert.equal(formatReportingMinor('0', 2, 'USD'), '$0.00');
  assert.equal(formatReportingMinor('5', 2, 'USD'), '$0.05');
  assert.equal(formatReportingMinor('123456789', 2, 'USD'), '$1,234,567.89');
  assert.equal(formatReportingMinor('0', 0, 'EUR'), 'EUR 0');
  assert.equal(formatReportingMinor('-1', 2, 'USD'), null);
  assert.equal(formatReportingMinor('1e3', 2, 'USD'), null);
  assert.equal(formatReportingMinor('0', 2, 'dollars'), null);
});
