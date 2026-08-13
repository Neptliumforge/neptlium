import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { SupabaseRateLimiter } from '../dist/security.js';

const reset = new Date(Date.now() + 60_000).toISOString();

test('distributed limiter uses server-only RPC with an opaque key', async () => {
  let call;
  const limiter = new SupabaseRateLimiter('https://example.supabase.co', 'service-secret', async (url, init) => {
    call = { url, init };
    return Response.json([{ allowed: true, remaining: 4, reset_at: reset }]);
  });
  const result = await limiter.consume('customer-ip:read', 5, 60_000);
  assert.equal(result.remaining, 4);
  assert.match(call.url, /\/rest\/v1\/rpc\/consume_api_rate_limit$/);
  assert.equal(call.init.headers.authorization, 'Bearer service-secret');
  const body = JSON.parse(call.init.body);
  assert.match(body.p_key, /^[0-9a-f]{64}$/);
  assert.equal(call.init.body.includes('customer-ip'), false);
});

test('distributed limiter fails closed on storage failure', async () => {
  const limiter = new SupabaseRateLimiter('https://example.supabase.co', 'service', async () => new Response('{}', { status: 503 }));
  await assert.rejects(() => limiter.consume('key', 5, 60_000), (error) => error.code === 'rate_limit_unavailable');
});

test('distributed limiter preserves explicit throttling', async () => {
  const limiter = new SupabaseRateLimiter('https://example.supabase.co', 'service', async () =>
    Response.json([{ allowed: false, remaining: 0, reset_at: reset }]),
  );
  await assert.rejects(() => limiter.consume('key', 5, 60_000), (error) => error.code === 'rate_limited');
});

test('distributed limiter migration is RLS-protected and service-role-only', () => {
  const migration = readFileSync(
    resolve(import.meta.dirname, '../../../supabase/migrations/20260813090000_distributed_api_rate_limiting.sql'),
    'utf8',
  );
  assert.match(migration, /alter table public\.api_rate_limits enable row level security/i);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /revoke all on function[\s\S]*from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function[\s\S]*to service_role/i);
});
