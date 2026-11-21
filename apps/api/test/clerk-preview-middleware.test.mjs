import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { authorizeClerkPreviewRequest, createClerkPreviewAuthorizer } from '../dist/clerk-preview-middleware.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const orgId = '00000000-0000-4000-8000-000000000002';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = {
  issuer: 'https://clerk-preview.example.test',
  audience: 'preview-api',
  authorizedParties: ['https://preview.example.test'],
  keys: { k1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000,
};
function jwt(overrides = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'k1' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({
    iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
    sub: 'user_12345678', iat: 1999999990, nbf: 1999999990, exp: 2000000300, ...overrides,
  })).toString('base64url');
  const payload = header + '.' + claims;
  return payload + '.' + sign('RSA-SHA256', Buffer.from(payload), privateKey).toString('base64url');
}
const store = {
  resolveActiveClerkPrincipal: async subject => subject === 'user_12345678' ? principalId : null,
  isActiveOrganizationMember: async (p, org) => p === principalId && org === orgId,
};

test('isolated middleware authorizes only verified preview bearer with membership', async () => {
  assert.deepEqual(await authorizeClerkPreviewRequest({ authorization: 'Bearer ' + jwt() }, orgId, trust, store, 'preview'), { principalId, organizationId: orgId });
  assert.equal(await authorizeClerkPreviewRequest({ authorization: 'Bearer ' + jwt() }, orgId, trust, store, 'production'), null);
  assert.equal(await authorizeClerkPreviewRequest({}, orgId, trust, store, 'preview'), null);
  assert.equal(await authorizeClerkPreviewRequest({ authorization: 'Basic ' + jwt() }, orgId, trust, store, 'preview'), null);
  assert.equal(await authorizeClerkPreviewRequest({ authorization: 'Bearer ' + jwt({ azp: 'https://untrusted.example.test' }) }, orgId, trust, store, 'preview'), null);
  assert.equal(await authorizeClerkPreviewRequest({ authorization: 'Bearer ' + jwt() }, '00000000-0000-4000-8000-000000000003', trust, store, 'preview'), null);
  assert.equal(await authorizeClerkPreviewRequest({ authorization: 'Bearer ' + jwt() }, orgId, trust, { ...store, resolveActiveClerkPrincipal: async () => null }, 'preview'), null);
});

test('Preview authorizer verifies bearer with issuer keys and denies when keys are unavailable', async () => {
  let requests = 0;
  const authorizer = createClerkPreviewAuthorizer(trust, store, async () => {
    requests++;
    return requests === 1 ? new Response(null, { status: 503 }) :
      Response.json({ keys: [{ ...trust.keys.k1, kid: 'k1' }] });
  });
  const headers = { authorization: 'Bearer ' + jwt() };
  assert.equal(await authorizer(headers, orgId, 'production'), null);
  assert.equal(await authorizer({}, orgId, 'preview'), null);
  assert.equal(await authorizer({ authorization: 'Bearer a.b.' + 'x'.repeat(16384) }, orgId, 'preview'), null);
  assert.equal(requests, 0);
  assert.equal(await authorizer(headers, orgId, 'preview'), null);
  assert.deepEqual(await authorizer(headers, orgId, 'preview'), { principalId, organizationId: orgId });
  assert.equal(await authorizer(headers, '00000000-0000-4000-8000-000000000003', 'preview'), null);
  assert.equal(requests, 2);
});
