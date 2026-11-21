import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createClerkProductionIdentityGate } from '../dist/clerk-production-identity-gate.js';

const issuer = 'https://clerk.neptlium.com';
const app = 'https://app.neptlium.com';
const audience = 'neptlium-api';
const subject = 'user_fixture123';
const principal = '00000000-0000-4000-8000-000000000001';
const tenant = 'f0000000-0000-4000-8000-000000000002';
const otherTenant = '00000000-0000-4000-8000-000000000003';
const env = {
  NODE_ENV: 'production',
  VERCEL_ENV: 'production',
  NEPTLIUM_AUTH_PROVIDER: 'clerk',
  NEPTLIUM_CLERK_CUTOVER_APPROVED: 'true',
  NEPTLIUM_IDENTITY_MAPPING_VERIFIED: 'true',
  NEPTLIUM_AUTH_ROLLBACK_VERIFIED: 'true',
  NEPTLIUM_CLERK_JWT_VERIFIER_VERIFIED: 'true',
  NEPTLIUM_CLERK_TENANT_ISOLATION_VERIFIED: 'true',
  NEPTLIUM_CLERK_ACCOUNT_BOOTSTRAP_VERIFIED: 'true',
  NEXT_PUBLIC_SITE_URL: app,
  NEPTLIUM_CLERK_PRODUCTION_ISSUER: issuer,
  NEPTLIUM_CLERK_PRODUCTION_AUDIENCE: audience,
};
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const loadKeys = async origin => {
  assert.equal(origin, issuer);
  return { fixture: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } };
};
const store = {
  resolveActiveClerkPrincipal: async value => value === subject ? principal : null,
  isActiveOrganizationMember: async (p, org) => p === principal && org === tenant,
};

function jwt(claims = {}, header = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = [
    { alg: 'RS256', typ: 'JWT', kid: 'fixture', ...header },
    { iss: issuer, aud: audience, azp: app, sub: subject, iat: now - 5, nbf: now - 5, exp: now + 60, ...claims },
  ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return payload + '.' + sign('RSA-SHA256', Buffer.from(payload), privateKey).toString('base64url');
}

test('production identity gate remains disabled unless all release and trust conditions match', () => {
  assert.equal(createClerkProductionIdentityGate({}, loadKeys, store), undefined);
  for (const key of Object.keys(env).filter(key => env[key] === 'true')) {
    assert.equal(createClerkProductionIdentityGate({ ...env, [key]: undefined }, loadKeys, store), undefined);
  }
  for (const override of [
    { VERCEL_ENV: 'preview' },
    { VERCEL_ENV: undefined },
    { NODE_ENV: 'test' },
    { NEPTLIUM_AUTH_PROVIDER: 'supabase' },
    { NEXT_PUBLIC_SITE_URL: 'https://preview.neptlium.com' },
    { NEPTLIUM_CLERK_PRODUCTION_ISSUER: 'https://arriving-pup-3595.clerk.accounts.dev' },
    { NEPTLIUM_CLERK_PRODUCTION_ISSUER: 'https://clerk.neptlium.com/path' },
    { NEPTLIUM_CLERK_PRODUCTION_AUDIENCE: 'neptlium-api-preview' },
  ]) assert.equal(createClerkProductionIdentityGate({ ...env, ...override }, loadKeys, store), undefined);
});

test('verified production subject resolves the preserved principal and active requested tenant', async () => {
  const gate = createClerkProductionIdentityGate(env, loadKeys, store);
  assert.deepEqual(await gate(jwt(), tenant.toUpperCase()), { principalId: principal, organizationId: tenant });
  assert.equal(await gate(jwt(), otherTenant), null);
  assert.equal(await gate(jwt({ sub: 'user_unlinked123' }), tenant), null);
});

test('bad JWT trust, invalid signature and inactive or unavailable membership deny', async () => {
  let reads = 0;
  const audited = { ...store, resolveActiveClerkPrincipal: async () => { reads++; return principal; } };
  const gate = createClerkProductionIdentityGate(env, loadKeys, audited);
  const forged = jwt().split('.');
  forged[2] = Buffer.alloc(256).toString('base64url');
  for (const token of [
    'malformed',
    forged.join('.'),
    jwt({ iss: 'https://arriving-pup-3595.clerk.accounts.dev' }),
    jwt({ aud: 'neptlium-api-preview' }),
    jwt({ azp: 'https://preview.neptlium.com' }),
    jwt({ exp: 1 }),
    jwt({ nbf: Math.floor(Date.now() / 1000) + 120 }),
    jwt({}, { typ: 'at+jwt' }),
  ]) assert.equal(await gate(token, tenant), null);
  assert.equal(reads, 0);

  for (const lookup of [async () => false, async () => { throw new Error('fixture outage'); }]) {
    const deny = createClerkProductionIdentityGate(env, loadKeys, { ...store, isActiveOrganizationMember: lookup });
    assert.equal(await deny(jwt(), tenant), null);
  }
  const outage = createClerkProductionIdentityGate(env, async () => { throw new Error('key service unavailable'); }, store);
  assert.equal(await outage(jwt(), tenant), null);
});
