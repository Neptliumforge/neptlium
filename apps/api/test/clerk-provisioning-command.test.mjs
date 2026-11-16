import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { provisionClerkPreviewIdentity } from '../dist/clerk-provisioning-command.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = {
  issuer: 'https://clerk.example.test', audience: 'neptlium-api',
  authorizedParties: ['https://app.example.test'],
  keys: { key1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000,
};
function token(overrides = {}) {
  const parts = [{ alg: 'RS256', kid: 'key1', typ: 'JWT' },
    { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
      sub: 'user_12345678', exp: 2000000300, iat: 1999999990, nbf: 1999999990, ...overrides },
  ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url'));
  const data = parts.join('.');
  return data + '.' + sign('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url');
}
const key = 'request_123456789012345';

test('Preview passes only independently verified Clerk subject to atomic adapter', async () => {
  const calls = [];
  const store = { provisionVerifiedSubject: async (...args) => {
    calls.push(args); return { principalId, replayed: false };
  } };
  assert.deepEqual(await provisionClerkPreviewIdentity('preview', token({ email: 'untrusted@example.test' }), key, trust, store),
    { ok: true, principalId, replayed: false });
  assert.deepEqual(calls, [['user_12345678', key]]);
});

test('production, invalid JWT and malformed idempotency key never write', async () => {
  let calls = 0;
  const store = { provisionVerifiedSubject: async () => { calls++; return { principalId, replayed: false }; } };
  assert.deepEqual(await provisionClerkPreviewIdentity('production', token(), key, trust, store), { ok: false, reason: 'not-preview' });
  assert.deepEqual(await provisionClerkPreviewIdentity('preview', 'forged', key, trust, store), { ok: false, reason: 'invalid-token' });
  assert.deepEqual(await provisionClerkPreviewIdentity('preview', token(), 'short', trust, store), { ok: false, reason: 'invalid-request' });
  assert.equal(calls, 0);
});

test('storage failure and malformed storage response deny access', async () => {
  assert.deepEqual(await provisionClerkPreviewIdentity('preview', token(), key, trust,
    { provisionVerifiedSubject: async () => { throw new Error('database offline'); } }),
    { ok: false, reason: 'storage-unavailable' });
  assert.deepEqual(await provisionClerkPreviewIdentity('preview', token(), key, trust,
    { provisionVerifiedSubject: async () => ({ principalId: 'invalid', replayed: false }) }),
    { ok: false, reason: 'storage-unavailable' });
});
