import test from 'node:test';
import assert from 'node:assert/strict';
import { StripeTreasuryAdapter } from '../dist/stripe-treasury.js';

const liveConfig = (overrides = {}) => ({
  secretKey: 'sk_live_fixture',
  webhookSecret: 'whsec_fixture',
  financialAccountId: 'fa_fixture',
  environment: 'LIVE',
  eligibilityVerified: true,
  liveExecutionEnabled: false,
  ...overrides,
});

test('closed Stripe Treasury gate never calls provider', async () => {
  let calls = 0;
  const adapter = new StripeTreasuryAdapter(liveConfig(), async () => {
    calls += 1;
    throw new Error('must not be called');
  });
  await assert.rejects(
    () => adapter.createInboundTransfer({ amount: 100, currency: 'usd', paymentMethod: 'pm_fixture', idempotencyKey: 'idem-fixture-1' }),
    (error) => error.code === 'provider_capability_unavailable',
  );
  assert.equal(calls, 0);
});

test('verified enabled Stripe Treasury adapter uses official InboundTransfer contract and idempotency', async () => {
  let request;
  const adapter = new StripeTreasuryAdapter(
    liveConfig({ liveExecutionEnabled: true }),
    async (url, init) => {
      request = { url, init };
      return new Response(JSON.stringify({
        id: 'ibt_fixture',
        object: 'treasury.inbound_transfer',
        amount: 1234,
        currency: 'usd',
        financial_account: 'fa_fixture',
        status: 'processing',
        transaction: null,
        livemode: true,
        returned: false,
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  );
  const result = await adapter.createInboundTransfer({
    amount: 1234,
    currency: 'usd',
    paymentMethod: 'pm_fixture123',
    idempotencyKey: 'funding-intent-unique-key',
    description: 'Neptlium controlled funding',
  });
  assert.equal(request.url, 'https://api.stripe.com/v1/treasury/inbound_transfers');
  assert.equal(request.init.method, 'POST');
  assert.equal(request.init.headers['idempotency-key'], 'funding-intent-unique-key');
  const form = request.init.body;
  assert.equal(form.get('financial_account'), 'fa_fixture');
  assert.equal(form.get('amount'), '1234');
  assert.equal(form.get('currency'), 'usd');
  assert.equal(form.get('origin_payment_method'), 'pm_fixture123');
  assert.equal(result.id, 'ibt_fixture');
  assert.equal(result.status, 'processing');
  assert.equal(result.livemode, true);
});

test('TEST Stripe object cannot enter LIVE adapter state', async () => {
  const adapter = new StripeTreasuryAdapter(
    liveConfig({ liveExecutionEnabled: true }),
    async () => new Response(JSON.stringify({
      id: 'ibt_test_fixture',
      object: 'treasury.inbound_transfer',
      amount: 100,
      currency: 'usd',
      financial_account: 'fa_fixture',
      status: 'processing',
      transaction: null,
      livemode: false,
      returned: false,
    }), { status: 200 }),
  );
  await assert.rejects(
    () => adapter.createInboundTransfer({ amount: 100, currency: 'usd', paymentMethod: 'pm_fixture123', idempotencyKey: 'funding-intent-unique-key' }),
    (error) => error.code === 'provider_environment_mismatch',
  );
});
