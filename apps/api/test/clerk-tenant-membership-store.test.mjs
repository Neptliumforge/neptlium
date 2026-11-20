import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseClerkTenantMembershipStore } from '../dist/clerk-tenant-membership-store.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const tenantId = '00000000-0000-4000-8000-000000000002';

test('membership RPC requires an explicit boolean true', async () => {
  const calls = [];
  const store = new SupabaseClerkTenantMembershipStore('https://db.example.test', 'server-only-key',
    async (url, options) => {
      calls.push({ url, options });
      return new Response('true', { status: 200, headers: { 'content-type': 'application/json' } });
    });
  assert.equal(await store.hasActiveMembership(principalId, tenantId), true);
  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0].url).pathname, '/rest/v1/rpc/authorize_clerk_preview_tenant_membership');
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), { p_principal_id: principalId, p_tenant_id: tenantId });
});

test('missing RPC, invalid response, or denial never grants membership', async () => {
  for (const [status, body] of [[404, '{}'], [200, '{}'], [200, 'null'], [200, 'false']]) {
    const store = new SupabaseClerkTenantMembershipStore('https://db.example.test', 'server-only-key',
      async () => new Response(body, { status }));
    if (status === 200 && body === 'false') {
      assert.equal(await store.hasActiveMembership(principalId, tenantId), false);
    } else {
      await assert.rejects(() => store.hasActiveMembership(principalId, tenantId));
    }
  }
});

test('invalid tenant and principal identifiers deny without a database request', async () => {
  let calls = 0;
  const store = new SupabaseClerkTenantMembershipStore('https://db.example.test', 'server-only-key',
    async () => { calls++; return new Response('true'); });
  assert.equal(await store.hasActiveMembership('forged', tenantId), false);
  assert.equal(await store.hasActiveMembership(principalId, 'forged'), false);
  assert.equal(calls, 0);
});

test('tenant membership store requires secure server configuration', () => {
  assert.throws(() => new SupabaseClerkTenantMembershipStore('http://db.example.test', 'key'));
  assert.throws(() => new SupabaseClerkTenantMembershipStore('https://db.example.test', ''));
});
