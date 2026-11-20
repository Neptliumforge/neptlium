import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { authorizePreviewClerkTenant } from '../dist/clerk-preview-tenant-gate.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const principalId = '00000000-0000-4000-8000-000000000001';
const tenantId = '00000000-0000-4000-8000-000000000002';
const trust = { issuer: 'https://clerk.example.test', audience: 'neptlium-api',
  authorizedParties: ['https://preview.example.test'],
  keys: { k1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000 };
function token() {
  const parts = [{ alg: 'RS256', kid: 'k1', typ: 'JWT' },
    { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
      sub: 'user_12345678', exp: 2000000300, nbf: 1999999990, iat: 1999999990 },
  ].map(x => Buffer.from(JSON.stringify(x)).toString('base64url'));
  const body = parts.join('.');
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url');
}
const principals = { resolveActiveClerkPrincipal: async () => principalId };

test('Preview requires active membership after verified identity', async () => {
  const calls = [];
  const memberships = { hasActiveMembership: async (p, t) => {
    calls.push([p, t]); return true;
  } };
  assert.deepEqual(await authorizePreviewClerkTenant('preview', token(), tenantId, trust, principals, memberships),
    { principalId, tenantId });
  assert.deepEqual(calls, [[principalId, tenantId]]);
});

test('valid Clerk identity without tenant membership is denied', async () => {
  assert.equal(await authorizePreviewClerkTenant('preview', token(), tenantId, trust, principals,
    { hasActiveMembership: async () => false }), null);
});

test('membership storage failure denies access', async () => {
  assert.equal(await authorizePreviewClerkTenant('preview', token(), tenantId, trust, principals,
    { hasActiveMembership: async () => { throw new Error('database unavailable'); } }), null);
});

test('production, invalid tenant and forged JWT never query membership', async () => {
  let calls = 0;
  const memberships = { hasActiveMembership: async () => { calls++; return true; } };
  assert.equal(await authorizePreviewClerkTenant('production', token(), tenantId, trust, principals, memberships), null);
  assert.equal(await authorizePreviewClerkTenant('preview', token(), 'not-a-tenant', trust, principals, memberships), null);
  assert.equal(await authorizePreviewClerkTenant('preview', 'forged', tenantId, trust, principals, memberships), null);
  assert.equal(calls, 0);
});
