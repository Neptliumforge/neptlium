import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { loadConfig } from '../dist/config.js';
import { executeStripeWebhook } from '../dist/stripe-serverless.js';

const signingSecret = 'gate04-test-signing-secret';
const timestamp = 1789266000;
const now = new Date(timestamp * 1000);

function config() {
  return loadConfig({
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
    STRIPE_WEBHOOK_SECRET: signingSecret,
    WEBHOOK_TOLERANCE_SECONDS: '300',
  });
}

function signature(body) {
  const digest = createHmac('sha256', signingSecret)
    .update(Buffer.concat([Buffer.from(`${timestamp}.`), body]))
    .digest('hex');
  return `t=${timestamp},v1=${digest}`;
}

test('payment-mode Stripe completion persists ignored disposition evidence', async () => {
  const body = Buffer.from(JSON.stringify({
    id: 'evt_gate04_disposition',
    object: 'event',
    livemode: false,
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_gate04_disposition', mode: 'payment', payment_status: 'paid' } },
  }));
  const calls = [];
  const storage = async (url, init = {}) => {
    const parsedBody = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url: String(url), body: parsedBody });
    if (String(url).endsWith('/provider_webhook_inbox')) return new Response('', { status: 201 });
    if (String(url).endsWith('/rpc/claim_provider_webhook'))
      return new Response(JSON.stringify({ processing_state: 'processing' }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (String(url).endsWith('/rpc/complete_provider_webhook'))
      return new Response(JSON.stringify({ processing_state: 'processed' }), { status: 200, headers: { 'content-type': 'application/json' } });
    throw new Error(`Unexpected request ${url}`);
  };

  const response = await executeStripeWebhook(
    { method: 'POST', headers: { 'stripe-signature': signature(body) }, rawBody: body },
    { config: config(), fetch: storage, now: () => now },
  );

  assert.equal(response.statusCode, 202);
  assert.deepEqual(JSON.parse(response.body), {
    received: true,
    duplicate: false,
    action: 'ignored',
    reason: 'stripe_capital_funding_not_enabled',
  });

  const completion = calls.find((call) => call.url.endsWith('/rpc/complete_provider_webhook'));
  assert.ok(completion);
  assert.equal(completion.body.p_provider, 'stripe');
  assert.equal(completion.body.p_provider_event_id, 'evt_gate04_disposition');
  assert.equal(completion.body.p_disposition_action, 'ignored');
  assert.equal(completion.body.p_disposition_reason, 'stripe_capital_funding_not_enabled');
  assert.doesNotMatch(JSON.stringify(calls), /transactions|portfolios|funding_intents|settlement_evidence|ledger_journals|ledger_postings|subscriptions/i);
});
