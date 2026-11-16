import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseClerkAccountCollisionStore } from '../dist/clerk-collision-store.js';

const base = 'https://db.example.test';
const key = 'test-only-secret';

test('collision lookup uses a narrow server-side filter and server-only credentials', async () => {
  let seen;
  const store = new SupabaseClerkAccountCollisionStore(base, key, async (url, init) => {
    seen = { url, init };
    return new Response(JSON.stringify([{ id: 'id1', email: 'TEST@EXAMPLE.TEST' }]), { status: 200 });
  });
  assert.deepEqual(await store.findProfilesByNormalizedEmail('test@example.test'), [{ id: 'id1' }]);
  const url = new URL(seen.url);
  assert.equal(url.pathname, '/rest/v1/profiles');
  assert.equal(url.searchParams.get('email'), 'ilike.test@example.test');
  assert.equal(url.searchParams.get('limit'), '2');
  assert.equal(seen.init.headers.apikey, key);
});

test('collision lookup fails closed on incomplete results, HTTP errors and invalid rows', async () => {
  for (const response of [
    new Response('[]', { status: 503 }),
    new Response(JSON.stringify([{ id: 'a', email: 'a@b.test' }, { id: 'b', email: 'b@c.test' }]), { status: 200 }),
    new Response(JSON.stringify([{ id: 4, email: 'a@b.test' }]), { status: 200 }),
  ]) {
    const store = new SupabaseClerkAccountCollisionStore(base, key, async () => response);
    await assert.rejects(store.findProfilesByNormalizedEmail('a@b.test'));
  }
});

test('collision lookup requires https and server credentials', () => {
  assert.throws(() => new SupabaseClerkAccountCollisionStore('http://db.example.test', key));
  assert.throws(() => new SupabaseClerkAccountCollisionStore(base, ''));
});
