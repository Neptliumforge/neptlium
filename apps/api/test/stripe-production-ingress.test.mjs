import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadConfig } from '../dist/config.js';
import { executeStripeWebhook } from '../dist/stripe-serverless.js';

const endpointSecret = 'whsec_gate01b_test_only';
const timestamp = 1789236000;
const now = new Date(timestamp * 1000);
const base = {
  id: 'evt_test',
  type: 'checkout.session.completed',
  created: timestamp,
  livemode: false,
  data: {
    object: {
      id: 'cs_test',
      mode: 'subscription',
      payment_status: 'paid',
      customer: 'cus_test',
      subscription: 'sub_test',
      metadata: { user_id: '11111111-1111-4111-8111-111111111111', plan: 'pro' },
    },
  },
};
const raw = (value = base) => Buffer.from(JSON.stringify(value));
const signature = (body, secret = endpointSecret) =>
  `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.`).update(body).digest('hex')}`;
const config = (overrides = {}) =>
  loadConfig({
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'fixture-key',
    STRIPE_WEBHOOK_SECRET: endpointSecret,
    STRIPE_WEBHOOK_ENVIRONMENT: 'test',
    ...overrides,
  });
function storage(calls, { claim, finishStatus = 200, duplicate = false } = {}) {
  let stored;
  return async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url: String(url), body });
    if (String(url).endsWith('/provider_webhook_inbox')) {
      stored = body.payload;
      return new Response('', { status: duplicate ? 409 : 201 });
    }
    if (String(url).includes('select=payload_digest'))
      return Response.json([
        { payload_digest: createHash('sha256').update(raw(stored)).digest('hex') },
      ]);
    if (String(url).endsWith('/rpc/claim_provider_webhook_v2'))
      return Response.json(
        claim ?? { acquired: true, state: 'processing', token: 'fence-test', payload: stored },
      );
    if (String(url).endsWith('/rpc/finish_provider_webhook_v2'))
      return Response.json({ state: 'processed' }, { status: finishStatus });
    if (String(url).endsWith('/rpc/fail_provider_webhook_v2'))
      return Response.json({ state: 'recorded' });
    assert.fail(`Unexpected storage boundary: ${url}`);
  };
}
async function run(payload = base, options = {}, configOverrides = {}) {
  const calls = [];
  const body = raw(payload);
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(configOverrides), fetch: storage(calls, options), now: () => now },
  );
  return { response, calls, result: JSON.parse(response.body) };
}
const finish = (calls) =>
  calls.find((call) => call.url.endsWith('/rpc/finish_provider_webhook_v2'))?.body;

test('verified subscription event uses one fenced atomic finish and never PATCHes subscription rows', async () => {
  const { response, calls } = await run();
  assert.equal(response.statusCode, 202);
  assert.equal(calls.length, 3);
  assert.equal(finish(calls).p_token, 'fence-test');
  const command = finish(calls).p_disposition.command;
  assert.equal(command.customerId, 'cus_test');
  assert.equal(command.subscriptionId, 'sub_test');
  assert.equal(command.environment, 'test');
  assert.equal(command.eventCreated, timestamp);
  assert.equal(command.eventId, base.id);
  assert.doesNotMatch(
    JSON.stringify(calls),
    /rest\/v1\/subscriptions|settlement_evidence|ledger_|portfolios|transactions/,
  );
});

test('invoice paid is evidence and cannot reactivate a canceled subscription', async () => {
  const { response, calls } = await run({
    ...base,
    type: 'invoice.paid',
    data: { object: { customer: 'cus_test' } },
  });
  assert.equal(response.statusCode, 202);
  assert.equal(finish(calls).p_disposition.reason, 'invoice_requires_subscription_sync');
  assert.equal(finish(calls).p_disposition.command, undefined);
});

for (const status of ['canceled', 'unpaid', 'paused', 'incomplete_expired', 'past_due']) {
  test(`subscription ${status} preserves restrictive lifecycle and exact subscription identity`, async () => {
    const { response, calls } = await run({
      ...base,
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_test', customer: 'cus_test', status } },
    });
    assert.equal(response.statusCode, 202);
    assert.equal(finish(calls).p_disposition.command.status, status);
  });
}

test('subscription deletion becomes cancellation even without an object status', async () => {
  const { calls } = await run({
    ...base,
    type: 'customer.subscription.deleted',
    data: { object: { id: 'sub_test', customer: 'cus_test' } },
  });
  assert.equal(finish(calls).p_disposition.command.status, 'canceled');
});

test('unknown lifecycle remains ignored; unpaid checkout cannot activate', async () => {
  const unknown = await run({
    ...base,
    type: 'customer.subscription.updated',
    data: { object: { status: 'unknown' } },
  });
  assert.equal(finish(unknown.calls).p_disposition.reason, 'unsupported_subscription_state');
  const unpaid = await run({
    ...base,
    data: { object: { ...base.data.object, payment_status: 'unpaid' } },
  });
  assert.equal(finish(unpaid.calls).p_disposition.reason, 'checkout_payment_unconfirmed');
});

test('unavailable atomic mutation marks the fence failed and returns retryable failure', async () => {
  const { response, calls } = await run(base, { finishStatus: 409 });
  assert.equal(response.statusCode, 503);
  const failure = calls.find((call) => call.url.endsWith('/rpc/fail_provider_webhook_v2'));
  assert.equal(failure.body.p_token, 'fence-test');
});

test('active lease and backoff return 503 without mutation; terminal duplicate returns 200', async () => {
  for (const state of ['processing', 'failed']) {
    const { response, calls } = await run(base, { claim: { acquired: false, state } });
    assert.equal(response.statusCode, 503);
    assert.equal(finish(calls), undefined);
  }
  const { response, calls } = await run(base, {
    duplicate: true,
    claim: { acquired: false, state: 'processed' },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(finish(calls), undefined);
});

test('legacy claim response cannot grant a processing fence', async () => {
  const { response, calls } = await run(base, { claim: { processing_state: 'processing' } });
  assert.equal(response.statusCode, 503);
  assert.equal(finish(calls), undefined);
});

test('wrong or missing environment fails before inbox write', async () => {
  for (const environment of ['live', undefined]) {
    const { response, calls } = await run(base, {}, { STRIPE_WEBHOOK_ENVIRONMENT: environment });
    assert.equal(response.statusCode, 503);
    assert.equal(calls.length, 0);
  }
});

test('signed malformed event identity and ordering fields reject before inbox storage', async () => {
  for (const payload of [
    { ...base, id: '' },
    { ...base, created: undefined },
    { ...base, created: '123' },
  ]) {
    const { response, calls } = await run(payload);
    assert.equal(response.statusCode, 422);
    assert.equal(calls.length, 0);
  }
});

test('payment-mode and unsupported events retain ignored disposition without financial mutation', async () => {
  for (const payload of [
    { ...base, data: { object: { mode: 'payment' } } },
    { ...base, type: 'charge.succeeded' },
  ]) {
    const { response, calls } = await run(payload);
    assert.equal(response.statusCode, 202);
    assert.equal(finish(calls).p_disposition.action, 'ignored');
    assert.doesNotMatch(
      JSON.stringify(calls),
      /settlement_evidence|ledger_|portfolios|transactions/,
    );
  }
});

test('missing/invalid signatures, body mutation, stale timestamp and missing secret fail before storage', async () => {
  const body = raw();
  let requests = 0;
  const fetch = async () => {
    requests++;
    assert.fail('no storage allowed');
  };
  for (const request of [
    { headers: {}, rawBody: body },
    { headers: { 'stripe-signature': signature(body, 'wrong') }, rawBody: body },
    {
      headers: { 'stripe-signature': signature(body) },
      rawBody: Buffer.concat([body, Buffer.from(' ')]),
    },
  ]) {
    const response = await executeStripeWebhook(
      { method: 'POST', ...request },
      { config: config(), fetch, now: () => now },
    );
    assert.equal(response.statusCode, 401);
  }
  const stale = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(), fetch, now: () => new Date(now.getTime() + 301000) },
  );
  assert.equal(stale.statusCode, 401);
  const missing = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config({ STRIPE_WEBHOOK_SECRET: undefined }), fetch, now: () => now },
  );
  assert.equal(missing.statusCode, 503);
  assert.equal(requests, 0);
});

test('both ingress paths use the fenced execution boundary', () => {
  const route = readFileSync(new URL('../src/financial-routes.ts', import.meta.url), 'utf8');
  const source = readFileSync(new URL('../src/stripe-serverless.ts', import.meta.url), 'utf8');
  assert.match(route, /executeStripeWebhook\(/);
  assert.match(source, /processStoredWebhook\(/);
  assert.doesNotMatch(source, /subscriptions\.apply|claimWebhook\(|completeWebhook\(/);
});
