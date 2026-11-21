import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { SupabaseClerkPreviewIdentityStore, authenticateClerkPreviewTenant } from '../dist/clerk-preview-identity.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const orgId = '00000000-0000-4000-8000-000000000002';
const subject = 'user_12345678';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = { issuer: 'https://clerk-preview.example.test', audience: 'preview-api', authorizedParties: ['https://preview.example.test'], keys: { k1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } }, nowSeconds: 2000000000 };
function token() {
  const parts = [{ alg: 'RS256', kid: 'k1', typ: 'JWT' }, { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0], sub: subject, exp: 2000000300, iat: 1999999990, nbf: 1999999990 }].map(x => Buffer.from(JSON.stringify(x)).toString('base64url'));
  const body = parts.join('.');
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url');
}
const clerkLink = { principal_id: principalId, provider: 'CLERK', provider_subject: subject, status: 'ACTIVE' };
const activePrincipal = { id: principalId, status: 'ACTIVE', suspended_at: null, retired_at: null };

function reply(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } }); }

test('durable resolver requires exactly one active Clerk link and active principal', async () => {
  const paths = [];
  const store = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async url => {
    paths.push(String(url));
    return String(url).includes('identity_provider_subjects') ? reply([clerkLink]) : reply([activePrincipal]);
  });
  assert.equal(await store.resolveActiveClerkPrincipal(subject), principalId);
  assert.match(paths[0], /provider=eq.CLERK/);
  assert.match(paths[0], /status=eq.ACTIVE/);
  assert.equal(await store.isActiveOrganizationMember(principalId, orgId), false);
});

test('missing, duplicate, revoked, suspended and unavailable identity all fail closed', async () => {
  for (const links of [[], [{ principal_id: principalId }, { principal_id: principalId }]]) {
    const store = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async () => reply(links));
    assert.equal(await store.resolveActiveClerkPrincipal(subject), null);
  }
  const suspended = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async url =>
    reply(String(url).includes('identity_provider_subjects') ? [clerkLink] : [{ ...activePrincipal, status: 'SUSPENDED', suspended_at: '2026-01-01' }]));
  assert.equal(await suspended.resolveActiveClerkPrincipal(subject), null);
  const unavailable = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async () => reply([], 503));
  await assert.rejects(() => unavailable.resolveActiveClerkPrincipal(subject), error => error.code === 'identity_storage_unavailable');
});

test('Preview tenant authenticator rejects production, wrong tenant, missing membership and forged JWT', async () => {
  const store = { resolveActiveClerkPrincipal: async () => principalId, isActiveOrganizationMember: async () => false };
  assert.equal(await authenticateClerkPreviewTenant(token(), orgId, trust, store, 'production'), null);
  assert.equal(await authenticateClerkPreviewTenant(token(), 'not-a-uuid', trust, store, 'preview'), null);
  assert.equal(await authenticateClerkPreviewTenant(token(), orgId, trust, store, 'preview'), null);
  assert.equal(await authenticateClerkPreviewTenant('forged', orgId, trust, { ...store, isActiveOrganizationMember: async () => true }, 'preview'), null);
});

test('verified Preview token and explicitly authorized membership resolve stable principal', async () => {
  const store = { resolveActiveClerkPrincipal: async () => principalId, isActiveOrganizationMember: async (p, o) => p === principalId && o === orgId };
  assert.deepEqual(await authenticateClerkPreviewTenant(token(), orgId, trust, store, 'preview'), { principalId, organizationId: orgId });
  assert.equal(await authenticateClerkPreviewTenant(token(), '00000000-0000-4000-8000-000000000003', trust, store, 'preview'), null);
});

const supabaseUserId = '00000000-0000-4000-8000-000000000111';
const membershipLink = { principal_id: principalId, provider: 'SUPABASE_AUTH', provider_subject: supabaseUserId, status: 'ACTIVE' };
const activeMembership = { organization_id: orgId, user_id: supabaseUserId, status: 'active', suspended_at: null, revoked_at: null };
test('membership is authorized only through active Supabase Auth subject linked to the same principal', async () => {
  const seen = [];
  const store = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async url => {
    const path = String(url); seen.push(path);
    if (path.includes('identity_provider_subjects')) return reply([membershipLink]);
    if (path.includes('organization_memberships')) return reply([activeMembership]);
    throw new Error('unexpected path');
  });
  assert.equal(await store.isActiveOrganizationMember(principalId, orgId), true);
  assert.match(seen[0], /provider=eq.SUPABASE_AUTH/);
  assert.match(seen[0], /principal_id=eq./);
  assert.match(seen[1], /user_id=eq./);
  assert.match(seen[1], /status=eq.active/);
});
test('cross-tenant, ambiguous, revoked and missing membership deny', async () => {
  for (const membership of [[], [{ organization_id: orgId, user_id: supabaseUserId, status: 'revoked' }], [{ organization_id: orgId, user_id: supabaseUserId, status: 'active' }, { organization_id: orgId, user_id: supabaseUserId, status: 'active' }]]) {
    const store = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async url => String(url).includes('identity_provider_subjects') ? reply([membershipLink]) : reply(membership));
    assert.equal(await store.isActiveOrganizationMember(principalId, orgId), false);
  }
  const wrong = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async url => String(url).includes('identity_provider_subjects') ? reply([membershipLink]) : reply([{ ...activeMembership, organization_id: '00000000-0000-4000-8000-000000000099' }]));
  assert.equal(await wrong.isActiveOrganizationMember(principalId, orgId), false);
});

test('incomplete identity or membership evidence cannot authorize', async () => {
  const cases = [
    [{ ...clerkLink, provider: undefined }, activePrincipal, membershipLink, activeMembership],
    [{ ...clerkLink, provider_subject: undefined }, activePrincipal, membershipLink, activeMembership],
    [{ ...clerkLink, status: undefined }, activePrincipal, membershipLink, activeMembership],
    [clerkLink, { ...activePrincipal, status: undefined }, membershipLink, activeMembership],
    [clerkLink, { ...activePrincipal, suspended_at: undefined }, membershipLink, activeMembership],
    [clerkLink, activePrincipal, { ...membershipLink, principal_id: undefined }, activeMembership],
    [clerkLink, activePrincipal, membershipLink, { ...activeMembership, revoked_at: undefined }],
    [null, activePrincipal, membershipLink, activeMembership],
  ];
  for (const rows of cases) {
    const store = new SupabaseClerkPreviewIdentityStore('https://db.example.test', 'fixture-only', async (_url, options) => {
      assert.equal(options.redirect, 'error');
      return reply([rows.shift()]);
    });
    assert.equal(await authenticateClerkPreviewTenant(token(), orgId, trust, store, 'preview'), null);
  }
});
