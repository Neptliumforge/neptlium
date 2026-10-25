import assert from 'node:assert/strict';
import test from 'node:test';
import { generateKeyPairSync, sign } from 'node:crypto';
import { loadConfig } from '../dist/config.js';
import {
  createClerkIdentityVerifier,
  createClerkPrincipalAuthenticator,
  bootstrapClerkIdentity,
} from '../dist/clerk-authentication.js';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const env = {
  NODE_ENV: 'test',
  AUTH_MODE: 'CLERK_DEVELOPMENT',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  CLERK_JWT_KEY: publicKey.export({ type: 'spki', format: 'pem' }),
  CLERK_ISSUER: 'https://test.clerk.accounts.dev',
  CLERK_AUTHORIZED_PARTIES: 'http://localhost:3000',
};
const config = loadConfig(env);
const now = Math.floor(Date.now() / 1000);
function jwt(overrides = {}, key = privateKey) {
  const parts = [
    { alg: 'RS256', typ: 'JWT', kid: 'test' },
    {
      sub: 'user_one',
      sid: 'sess_one',
      iss: env.CLERK_ISSUER,
      azp: 'http://localhost:3000',
      iat: now,
      nbf: now - 1,
      exp: now + 60,
      ...overrides,
    },
  ].map((v) => Buffer.from(JSON.stringify(v)).toString('base64url'));
  const input = parts.join('.');
  return input + '.' + sign('RSA-SHA256', Buffer.from(input), key).toString('base64url');
}
function backend({ user = {}, session = {} } = {}) {
  return {
    users: {
      getUser: async () => ({
        id: 'user_one',
        banned: false,
        locked: false,
        primaryEmailAddressId: 'email_one',
        emailAddresses: [
          {
            id: 'email_one',
            emailAddress: 'owner@example.test',
            verification: { status: 'verified' },
          },
        ],
        ...user,
      }),
    },
    sessions: {
      getSession: async () => ({
        id: 'sess_one',
        userId: 'user_one',
        status: 'active',
        ...session,
      }),
    },
  };
}
test('real RSA signature, exact issuer and browser origin are verified before contact and session lookup', async () => {
  assert.deepEqual(await createClerkIdentityVerifier(config, backend())(jwt()), {
    subject: 'user_one',
    verifiedEmail: 'owner@example.test',
  });
});
for (const [name, change] of Object.entries({
  expired: { exp: now - 1 },
  future: { nbf: now + 600 },
  issuer: { iss: 'https://other.clerk.accounts.dev' },
  origin: { azp: 'https://evil.test' },
  missingOrigin: { azp: undefined },
  machine: { sid: undefined },
  subject: { sub: 'wallet_123' },
})) {
  test('rejects ' + name, async () =>
    assert.equal(await createClerkIdentityVerifier(config, backend())(jwt(change)), null),
  );
}
test('forged signature is rejected', async () => {
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
  assert.equal(
    await createClerkIdentityVerifier(config, backend())(jwt({}, other.privateKey)),
    null,
  );
});
for (const [name, change] of Object.entries({
  revoked: { session: { status: 'revoked' } },
  sessionUserMismatch: { session: { userId: 'user_other' } },
  banned: { user: { banned: true } },
  locked: { user: { locked: true } },
  unverified: {
    user: {
      emailAddresses: [
        { id: 'email_one', emailAddress: 'x@test.dev', verification: { status: 'unverified' } },
      ],
    },
  },
  walletOnly: { user: { primaryEmailAddressId: null, emailAddresses: [] } },
})) {
  test('rejects ' + name, async () =>
    assert.equal(await createClerkIdentityVerifier(config, backend(change))(jwt()), null),
  );
}
test('provider outage fails closed with a normalized error', async () => {
  const b = backend();
  b.users.getUser = async () => {
    throw new Error('untrusted provider details');
  };
  await assert.rejects(
    createClerkIdentityVerifier(config, b)(jwt()),
    (e) => e.code === 'authentication_unavailable' && !e.message.includes('details'),
  );
});
test('principal UUID comes from durable mapping, never from token metadata or email', async () => {
  const verify = async () => ({ subject: 'user_one', verifiedEmail: 'owner@example.test' });
  const resolveActivePrincipal = async (provider, subject) => {
    assert.equal(provider, 'CLERK');
    assert.equal(subject, 'user_one');
    return { principal: { id: 'stable-principal' } };
  };
  assert.equal(
    (await createClerkPrincipalAuthenticator(verify, { resolveActivePrincipal })('token')).id,
    'stable-principal',
  );
  assert.equal(
    await createClerkPrincipalAuthenticator(verify, { resolveActivePrincipal: async () => null })(
      'token',
    ),
    null,
  );
  await assert.rejects(
    createClerkPrincipalAuthenticator(verify, undefined)('token'),
    (e) => e.code === 'identity_storage_unavailable',
  );
});
test('development mode rejects production, live keys, missing issuer and financial provider activation', () => {
  for (const override of [
    { NODE_ENV: 'production' },
    { VERCEL_ENV: 'production' },
    { CLERK_SECRET_KEY: 'sk_live_x' },
    { CLERK_ISSUER: '' },
    { CLERK_AUTHORIZED_PARTIES: '' },
    { ENABLE_MAINNET: 'true' },
  ])
    assert.throws(() => loadConfig({ ...env, ...override }));
  assert.equal(loadConfig({ NODE_ENV: 'test' }).AUTH_MODE, 'SUPABASE');
});
test('bootstrap forwards only verified identity to service-only command and refuses conflicts', async () => {
  const c = {
    ...config,
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'server-only',
  };
  const identity = { subject: 'user_one', verifiedEmail: 'owner@example.test' };
  const id = '00000000-0000-4000-8000-000000000001';
  const result = await bootstrapClerkIdentity(c, identity, 'request', async (url, init) => {
    assert.match(url, /bootstrap_development_clerk_identity$/);
    assert.deepEqual(JSON.parse(init.body), {
      p_subject: 'user_one',
      p_email: 'owner@example.test',
      p_request_id: 'request',
    });
    return new Response(JSON.stringify({ profile_id: id }));
  });
  assert.equal(result.profile_id, id);
  await assert.rejects(
    bootstrapClerkIdentity(c, identity, 'request', async () => new Response('{}', { status: 409 })),
    (e) => e.code === 'identity_link_unavailable',
  );
});

test('Clerk development cannot invoke the legacy provisioning command', async () => {
  const { buildApp } = await import('../dist/app.js');
  const app = await buildApp({
    config,
    authenticate: async () => ({ id: '00000000-0000-4000-8000-000000000001' }),
  });
  const response = await app.inject({
    method: 'POST',
    url: '/v1/account/provision',
    headers: { authorization: 'Bearer fixture' },
  });
  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error.code, 'invalid_state_transition');
});
