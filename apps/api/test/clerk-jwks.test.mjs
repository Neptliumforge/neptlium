import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { createClerkSigningKeyLoader } from '../dist/clerk-jwks.js';

const issuer = 'https://clerk-preview.example.test';
const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const key = { ...publicKey.export({ format: 'jwk' }), use: 'sig', alg: 'RS256', kid: 'first' };

test('loads issuer keys, shares concurrent fetches and refreshes rotated keys after expiry', async () => {
  let time = 0;
  let requests = 0;
  const load = createClerkSigningKeyLoader(issuer, async (url, init) => {
    assert.equal(url.href, issuer + '/.well-known/jwks.json');
    assert.equal(init.redirect, 'error');
    assert.ok(init.signal instanceof AbortSignal);
    requests++;
    return Response.json({ keys: [requests === 1 ? key : { ...key, kid: 'second' }] });
  }, () => time);
  const [first, concurrent] = await Promise.all([load(), load()]);
  assert.equal(first, concurrent);
  assert.deepEqual(Object.keys(first), ['first']);
  time = 59_999;
  assert.equal(await load(), first);
  time = 60_000;
  assert.deepEqual(Object.keys(await load()), ['second']);
  assert.equal(requests, 2);
});

test('rejects expired keys during an outage and retries on the next lookup', async () => {
  let time = 0;
  let available = true;
  const load = createClerkSigningKeyLoader(issuer, async () => available
    ? Response.json({ keys: [key] })
    : new Response(null, { status: 503 }), () => time);
  await load();
  time = 60_000;
  available = false;
  await assert.rejects(load, /unavailable/);
  available = true;
  assert.deepEqual(Object.keys(await load()), ['first']);
});

test('rejects malformed key sets, duplicate key IDs and oversized responses', async () => {
  for (const response of [
    Response.json({ keys: [key, key] }),
    Response.json({ keys: [{ ...key, n: undefined }] }),
    new Response(' '.repeat(65_537)),
  ]) {
    const load = createClerkSigningKeyLoader(issuer, async () => response);
    await assert.rejects(load, /Clerk/);
  }
});

test('requires an exact HTTPS issuer origin', () => {
  for (const invalid of ['http://example.test', issuer + '/other', 'https://user@example.test']) {
    assert.throws(() => createClerkSigningKeyLoader(invalid), /Invalid Clerk issuer/);
  }
});
