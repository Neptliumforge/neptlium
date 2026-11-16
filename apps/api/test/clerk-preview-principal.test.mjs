import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { authenticatePreviewClerkPrincipal } from '../dist/clerk-preview-principal.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = { issuer: 'https://clerk.example.test', audience: 'neptlium-api',
  authorizedParties: ['https://preview.example.test'],
  keys: { k1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000 };
const principalId = '00000000-0000-4000-8000-000000000001';
function token() {
  const parts = [{ alg: 'RS256', kid: 'k1', typ: 'JWT' },
    { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
      sub: 'user_12345678', exp: 2000000300, nbf: 1999999990, iat: 1999999990 },
  ].map(x => Buffer.from(JSON.stringify(x)).toString('base64url'));
  const body = parts.join('.');
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url');
}

test('Preview verifies and resolves Clerk principal without claiming Supabase Auth', async () => {
  assert.deepEqual(await authenticatePreviewClerkPrincipal('preview', token(), trust, {
    resolveActiveClerkPrincipal: async () => principalId,
  }), { id: principalId, provider: 'CLERK' });
});

test('production and unspecified environment deny before identity lookup', async () => {
  let calls = 0;
  const store = { resolveActiveClerkPrincipal: async () => { calls++; return principalId; } };
  for (const environment of ['production', undefined, 'development']) {
    assert.equal(await authenticatePreviewClerkPrincipal(environment, token(), trust, store), null);
  }
  assert.equal(calls, 0);
});

test('Preview denies missing durable mapping and invalid token', async () => {
  const store = { resolveActiveClerkPrincipal: async () => null };
  assert.equal(await authenticatePreviewClerkPrincipal('preview', token(), trust, store), null);
  assert.equal(await authenticatePreviewClerkPrincipal('preview', 'forged', trust, store), null);
});
