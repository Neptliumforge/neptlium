import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyStripeWebhook } from '../dist/stripe-webhook.js';

function signature(secret, timestamp, rawBody) {
  const signed = Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]);
  return createHmac('sha256', secret).update(signed).digest('hex');
}

test('Stripe webhook verifies raw body and preserves LIVE environment', () => {
  const secret = 'whsec_test_fixture';
  const now = 1_800_000_000;
  const rawBody = Buffer.from(JSON.stringify({ id: 'evt_live_1', type: 'treasury.inbound_transfer.succeeded', livemode: true }));
  const header = `t=${now},v1=${signature(secret, now, rawBody)}`;
  const event = verifyStripeWebhook({ rawBody, signatureHeader: header, endpointSecret: secret, toleranceSeconds: 300, nowSeconds: now });
  assert.equal(event.id, 'evt_live_1');
  assert.equal(event.environment, 'live');
});

test('Stripe webhook rejects tampered payloads and stale timestamps', () => {
  const secret = 'whsec_test_fixture';
  const now = 1_800_000_000;
  const rawBody = Buffer.from(JSON.stringify({ id: 'evt_1', type: 'event', livemode: false }));
  const header = `t=${now},v1=${signature(secret, now, rawBody)}`;
  assert.throws(() => verifyStripeWebhook({
    rawBody: Buffer.from(JSON.stringify({ id: 'evt_1', type: 'tampered', livemode: false })),
    signatureHeader: header,
    endpointSecret: secret,
    toleranceSeconds: 300,
    nowSeconds: now,
  }));
  assert.throws(() => verifyStripeWebhook({
    rawBody,
    signatureHeader: header,
    endpointSecret: secret,
    toleranceSeconds: 300,
    nowSeconds: now + 301,
  }));
});
