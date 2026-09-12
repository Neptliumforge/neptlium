import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadConfig } from '../dist/config.js';
import { executeStripeWebhook } from '../dist/stripe-serverless.js';

const endpointSecret = 'whsec_gate04_test_only';
const timestamp = 1789236000;
const now = new Date(timestamp * 1000);

function payload(overrides = {}) {
  return {
    id: 'evt_gate04_1',
    type: 'checkout.session.completed',
    livemode: false,
    data: { object: { id: 'cs_gate04_1', mode: 'subscription' } },
    ...overrides,
  };
}

function raw(value = payload()) {
  return Buffer.from(JSON.stringify(value));
}

function signature(body, secret = endpointSecret, signedAt = timestamp) {
  const digest = createHmac('sha256', secret)
    .update(Buffer.concat([Buffer.from(`${signedAt}.`), body]))
    .digest('hex');
  return `t=${signedAt},v1=${digest}`;
}

function config(secret = endpointSecret) {
  return loadConfig({
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-test-only',
    STRIPE_WEBHOOK_SECRET: secret,
    WEBHOOK_TOLERANCE_SECONDS: '300',
  });
}

function successfulStorage(calls) {
  return async (url, init = {}) => {
    const parsedBody = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url: String(url), method: init.method ?? 'GET', body: parsedBody });

    if (String(url).endsWith('/provider_webhook_inbox'))
      return new Response('', { status: 201 });
    if (String(url).endsWith('/rpc/claim_provider_webhook'))
      return new Response(JSON.stringify({ processing_state: 'processing' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    if (String(url).endsWith('/rpc/complete_provider_webhook'))
      return new Response(JSON.stringify({ processing_state: 'processed' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    throw new Error(`Unexpected request ${url}`);
  };
}

test('valid raw Stripe subscription evidence is verified, persisted, claimed and completed', async () => {
  const calls = [];
  const body = Buffer.from('{ "id":"evt_gate04_1", "type":"checkout.session.completed", "livemode":false, "data":{"object":{"id":"cs_gate04_1","mode":"subscription"}} }');
  const response = await executeStripeWebhook(
    {
      method: 'POST',
      headers: { 'stripe-signature': signature(body) },
      rawBody: body,
    },
    { config: config(), fetch: successfulStorage(calls), now: () => now },
  );

  assert.equal(response.statusCode, 202);
  const result = JSON.parse(response.body);
  assert.equal(result.received, true);
  assert.equal(result.duplicate, false);
  assert.equal(result.action, 'subscription_evidence');
  assert.equal(calls.length, 3);
  assert.match(calls[0].url, /provider_webhook_inbox$/);
  assert.equal(calls[0].body.provider, 'stripe');
  assert.equal(calls[0].body.provider_event_id, 'evt_gate04_1');
  assert.equal(calls[0].body.processing_state, 'received');
  assert.match(calls[1].url, /rpc\/claim_provider_webhook$/);
  assert.match(calls[2].url, /rpc\/complete_provider_webhook$/);
});

test('missing Stripe-Signature fails before durable storage', async () => {
  let calls = 0;
  const response = await executeStripeWebhook(
    { method: 'POST', headers: {}, rawBody: raw() },
    { config: config(), fetch: async () => { calls += 1; return new Response(); }, now: () => now },
  );
  assert.equal(response.statusCode, 401);
  assert.equal(JSON.parse(response.body).error.code, 'invalid_webhook');
  assert.equal(calls, 0);
});

test('invalid signature fails before durable storage', async () => {
  let calls = 0;
  const body = raw();
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body, 'wrong-secret') }, rawBody: body },
    { config: config(), fetch: async () => { calls += 1; return new Response(); }, now: () => now },
  );
  assert.equal(response.statusCode, 401);
  assert.equal(calls, 0);
});

test('body mutation after signing is rejected', async () => {
  const signed = raw();
  const mutated = Buffer.from(`${signed.toString('utf8')} `);
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(signed) }, rawBody: mutated },
    { config: config(), fetch: async () => { throw new Error('storage must not be called'); }, now: () => now },
  );
  assert.equal(response.statusCode, 401);
});

test('missing webhook secret fails closed', async () => {
  const body = raw();
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(undefined), fetch: async () => { throw new Error('storage must not be called'); }, now: () => now },
  );
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).error.code, 'provider_not_configured');
});

test('same durable event retry is acknowledged without a second domain effect', async () => {
  const calls = [];
  const body = raw();
  let requestCount = 0;
  const storage = async (url, init = {}) => {
    requestCount += 1;
    calls.push(String(url));
    if (requestCount === 1) return new Response('', { status: 409 });
    if (String(url).includes('select=payload_digest')) {
      const digest = createHmac('sha256', '').digest('hex');
      void digest;
      const { createHash } = await import('node:crypto');
      return new Response(JSON.stringify([{ payload_digest: createHash('sha256').update(body).digest('hex') }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (String(url).endsWith('/rpc/claim_provider_webhook'))
      return new Response(JSON.stringify({ processing_state: 'processed' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    throw new Error(`Unexpected duplicate request ${url}`);
  };

  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(), fetch: storage, now: () => now },
  );
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).action, 'already_processed');
  assert.equal(calls.some((value) => value.includes('complete_provider_webhook')), false);
});

test('payment-mode Checkout is durable evidence only and cannot credit capital', async () => {
  const calls = [];
  const body = raw({
    id: 'evt_payment_mode',
    type: 'checkout.session.completed',
    livemode: false,
    data: { object: { id: 'cs_payment', mode: 'payment', payment_status: 'paid', amount_total: 5000 } },
  });
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(), fetch: successfulStorage(calls), now: () => now },
  );
  assert.equal(response.statusCode, 202);
  const result = JSON.parse(response.body);
  assert.equal(result.action, 'ignored');
  assert.equal(result.reason, 'stripe_capital_funding_not_enabled');
  const serializedCalls = JSON.stringify(calls);
  assert.doesNotMatch(serializedCalls, /transactions|portfolios|settlement_evidence|ledger_/i);
});

test('unsupported signed Stripe events are safely ignored after durable evidence', async () => {
  const calls = [];
  const body = raw({ id: 'evt_unsupported', type: 'charge.succeeded', livemode: false, data: { object: { id: 'ch_1' } } });
  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(), fetch: successfulStorage(calls), now: () => now },
  );
  assert.equal(response.statusCode, 202);
  const result = JSON.parse(response.body);
  assert.equal(result.action, 'ignored');
  assert.equal(result.reason, 'unsupported_event_type');
});

test('Stripe ingress source cannot mutate legacy money or bypass canonical funding authority', () => {
  const source = readFileSync(new URL('../src/stripe-serverless.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\.from\(["']transactions["']\)/);
  assert.doesNotMatch(source, /\.from\(["']portfolios["']\)/);
  assert.doesNotMatch(source, /total_value/);
  assert.doesNotMatch(source, /recordSettlementEvidence\(/);
  assert.doesNotMatch(source, /postConfirmedFundingToPending\(/);
  assert.doesNotMatch(source, /makeFundingAvailable\(/);
  assert.doesNotMatch(source, /markFundingProviderConfirmed\(/);
  assert.match(source, /recordWebhook\(/);
  assert.match(source, /claimWebhook\(/);
  assert.match(source, /completeWebhook\(/);
});
