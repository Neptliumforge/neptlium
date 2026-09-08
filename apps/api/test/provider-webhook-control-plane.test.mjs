import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SupabaseFinancialOperations } from '../dist/financial-operations.js';

const migration = readFileSync(
  new URL(
    '../../../supabase/migrations/20260908053000_provider_webhook_control_plane.sql',
    import.meta.url,
  ),
  'utf8',
);

test('provider webhook migration creates leased retry and dead-letter lifecycle', () => {
  assert.match(migration, /'dead_letter'/);
  assert.match(migration, /lease_expires_at/);
  assert.match(migration, /next_attempt_at/);
  assert.match(migration, /dead_lettered_at/);
  assert.match(migration, /claim_provider_webhook/);
  assert.match(migration, /complete_provider_webhook/);
  assert.match(migration, /fail_provider_webhook/);
  assert.match(migration, /grant execute[\s\S]*service_role/i);
  assert.match(
    migration,
    /processing_state = 'processing'[\s\S]*returning \* into v_event/i,
  );
  assert.match(
    migration,
    /if v_event\.processing_state <> 'processing' then[\s\S]*return v_event/i,
  );
  assert.match(
    migration,
    /alter function public\.claim_provider_webhook[\s\S]*owner to postgres/i,
  );
  assert.match(
    migration,
    /revoke all on public\.provider_webhook_inbox from public, anon, authenticated/i,
  );
});

test('same provider event and same digest is an idempotent retry', async () => {
  let calls = 0;

  const request = async (url, init = {}) => {
    calls += 1;

    if (calls === 1) {
      assert.match(String(url), /provider_webhook_inbox$/);
      assert.equal(init.method, 'POST');
      return new Response('', { status: 409 });
    }

    assert.match(String(url), /select=payload_digest/);
    return new Response(
      JSON.stringify([{ payload_digest: 'same-digest' }]),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const operations = new SupabaseFinancialOperations(
    'https://example.supabase.co',
    'service-role',
    request,
  );

  const result = await operations.recordWebhook({
    provider: 'stripe',
    environment: 'live',
    providerEventId: 'evt_123',
    payloadDigest: 'same-digest',
    payload: { id: 'evt_123' },
    signatureVerifiedAt: new Date().toISOString(),
  });

  assert.equal(result, 'duplicate');
  assert.equal(calls, 2);
});

test('same provider event with different digest is a replay conflict', async () => {
  let calls = 0;

  const request = async () => {
    calls += 1;

    if (calls === 1) return new Response('', { status: 409 });

    return new Response(
      JSON.stringify([{ payload_digest: 'original-digest' }]),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  const operations = new SupabaseFinancialOperations(
    'https://example.supabase.co',
    'service-role',
    request,
  );

  await assert.rejects(
    () =>
      operations.recordWebhook({
        provider: 'stripe',
        environment: 'live',
        providerEventId: 'evt_123',
        payloadDigest: 'different-digest',
        payload: { id: 'evt_123', altered: true },
        signatureVerifiedAt: new Date().toISOString(),
      }),
    (error) =>
      error?.code === 'webhook_replay_detected' &&
      error?.status === 409,
  );
});

test('webhook processing transitions use backend-only RPC boundary', async () => {
  const calls = [];

  const request = async (url, init = {}) => {
    calls.push({
      url: String(url),
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    });

    return new Response(JSON.stringify({ processing_state: 'processing' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const operations = new SupabaseFinancialOperations(
    'https://example.supabase.co',
    'service-role',
    request,
  );

  await operations.claimWebhook('stripe', 'live', 'evt_1', 60);
  await operations.completeWebhook('stripe', 'live', 'evt_1');
  await operations.failWebhook('alchemy', 'live', 'evt_2', 'temporary_provider_error', 8);

  assert.match(calls[0].url, /rpc\/claim_provider_webhook$/);
  assert.match(calls[1].url, /rpc\/complete_provider_webhook$/);
  assert.match(calls[2].url, /rpc\/fail_provider_webhook$/);

  assert.equal(calls[0].body.p_provider_event_id, 'evt_1');
  assert.equal(calls[2].body.p_error_code, 'temporary_provider_error');
});
