import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { authenticateClerkBearer } from '../dist/clerk-bearer-adapter.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = {
  issuer: 'https://clerk.example.test', audience: 'neptlium-api',
  authorizedParties: ['https://app.example.test'],
  keys: { k1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000,
};
function jwt() {
  const parts = [{ alg: 'RS256', kid: 'k1', typ: 'JWT' },
    { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
      sub: 'user_12345678', iat: 1999999990, nbf: 1999999990, exp: 2000000300 },
  ].map(x => Buffer.from(JSON.stringify(x)).toString('base64url'));
  const body = parts.join('.');
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url');
}

test('valid bearer resolves a persisted principal', async () => {
  assert.deepEqual(await authenticateClerkBearer('Bearer ' + jwt(), trust, {
    resolveActiveClerkPrincipal: async subject => subject === 'user_12345678'
      ? '00000000-0000-4000-8000-000000000001' : null,
  }), { authorized: true, principalId: '00000000-0000-4000-8000-000000000001' });
});

test('missing, malformed and alternate auth schemes never query identity storage', async () => {
  let calls = 0;
  const store = { resolveActiveClerkPrincipal: async () => { calls++; return null; } };
  for (const header of [undefined, '', 'Basic abc', 'bearer ' + jwt(), 'Bearer ' + jwt() + ' extra']) {
    assert.deepEqual(await authenticateClerkBearer(header, trust, store),
      { authorized: false, reason: 'invalid-token' });
  }
  assert.equal(calls, 0);
});

test('unlinked and unavailable mappings deny access', async () => {
  assert.deepEqual(await authenticateClerkBearer('Bearer ' + jwt(), trust, {
    resolveActiveClerkPrincipal: async () => null,
  }), { authorized: false, reason: 'unlinked-identity' });
  assert.deepEqual(await authenticateClerkBearer('Bearer ' + jwt(), trust, {
    resolveActiveClerkPrincipal: async () => { throw new Error('storage down'); },
  }), { authorized: false, reason: 'identity-unavailable' });
});
