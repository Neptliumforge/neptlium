import test from 'node:test';
import assert from 'node:assert/strict';
import {
  investmentOrderCatalog,
  proposedInvestmentOrders,
  handleInvestmentOrderRoute,
} from '../dist/investment-orders.js';

test('proposed orders use immutable exact server prices, no returns and no enrollment authority', () => {
  assert.deepEqual(
    proposedInvestmentOrders.map((order) => [order.amountMinor, order.durationMonths]),
    [
      ['50000', 2],
      ['100000', 2],
      ['500000', 4],
      ['1500000', 6],
      ['2500000', 6],
    ],
  );
  assert.throws(() => {
    proposedInvestmentOrders[0].amountMinor = '1';
  }, TypeError);
  const catalog = investmentOrderCatalog();
  assert.equal(catalog.purchasable, false);
  for (const listing of catalog.listings) {
    assert.equal(listing.enrollmentEnabled, false);
    assert.equal(listing.returnTerms, null);
    assert.equal(listing.issuer, null);
    assert.equal(listing.legalApproval, 'PENDING');
  }
  catalog.listings[0].amountMinor = '1';
  assert.equal(investmentOrderCatalog().listings[0].amountMinor, '50000');
});

test('catalog and enrollment commands require authentication; authenticated commands still fail closed', async () => {
  const unauthorized = async () => {
    throw new Error('authentication required');
  };
  await assert.rejects(() =>
    handleInvestmentOrderRoute('GET', '/v1/investment-orders', unauthorized),
  );
  await assert.rejects(() =>
    handleInvestmentOrderRoute('POST', '/v1/investment-orders/enrollment-intents', unauthorized),
  );
  const owner = async () => 'server-principal';
  await assert.rejects(
    () => handleInvestmentOrderRoute('POST', '/v1/investment-orders/enrollment-intents', owner),
    (error) => error.status === 503 && error.code === 'provider_execution_disabled',
  );
  const history = await handleInvestmentOrderRoute(
    'GET',
    '/v1/investment-orders/enrollments',
    owner,
  );
  assert.equal(history.data.state, 'UNAVAILABLE');
  assert.equal(history.data.enrollments, null);
});
