import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseAtomicClerkProvisioningStore } from '../dist/clerk-atomic-store.js';

const url = 'https://db.example.test';
const key = 'server-only-test-key';
const subject = 'user_12345678';
const id = '00000000-0000-4000-8000-000000000001';
const requestId = 'request_123456789012345';

test('atomic adapter uses server-verified email and service-only RPC', async () => {
  let called;
  const store = new SupabaseAtomicClerkProvisioningStore(url, key,
    async s => { assert.equal(s, subject); return 'verified@example.test'; },
    async (target, options) => {
      called = { target, options };
      return new Response(JSON.stringify({ status: 'created', profile_id: id }), { status: 200 });
    });
  assert.deepEqual(await store.provisionVerifiedSubject(subject, requestId), { principalId: id, replayed: false });
  assert.equal(new URL(called.target).pathname, '/rest/v1/rpc/bootstrap_clerk_identity_principal');
  assert.equal(called.options.headers.apikey, key);
  assert.deepEqual(JSON.parse(called.options.body), {
    p_clerk_subject: subject, p_verified_email: 'verified@example.test', p_request_id: requestId,
  });
});

test('existing subject replays but email collision cannot authorize', async () => {
  for (const [status, shouldPass] of [['existing', true], ['link_required', false]]) {
    const store = new SupabaseAtomicClerkProvisioningStore(url, key, async () => 'verified@example.test',
      async () => new Response(JSON.stringify({ status, profile_id: id }), { status: 200 }));
    if (shouldPass) assert.deepEqual(await store.provisionVerifiedSubject(subject, requestId), { principalId: id, replayed: true });
    else await assert.rejects(store.provisionVerifiedSubject(subject, requestId));
  }
});

test('missing provider evidence, database failure and malformed response fail closed', async () => {
  let called = false;
  const missing = new SupabaseAtomicClerkProvisioningStore(url, key, async () => '', async () => { called = true; return new Response('{}'); });
  await assert.rejects(missing.provisionVerifiedSubject(subject, requestId));
  assert.equal(called, false);
  const outage = new SupabaseAtomicClerkProvisioningStore(url, key, async () => 'verified@example.test',
    async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(outage.provisionVerifiedSubject(subject, requestId));
  const malformed = new SupabaseAtomicClerkProvisioningStore(url, key, async () => 'verified@example.test',
    async () => new Response(JSON.stringify({ status: 'created', profile_id: 7 }), { status: 200 }));
  await assert.rejects(malformed.provisionVerifiedSubject(subject, requestId));
});
