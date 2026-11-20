import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { resolveVerifiedClerkPrincipal } from '../dist/clerk-principal-gate.js';

const principalId = '00000000-0000-4000-8000-000000000001';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const trust = {
  issuer: 'https://clerk.example.test', audience: 'neptlium-api',
  authorizedParties: ['https://app.example.test'],
  keys: { key1: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } },
  nowSeconds: 2000000000,
};
function token(overrides = {}) {
  const parts = [
    { alg: 'RS256', kid: 'key1', typ: 'JWT' },
    { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0],
      sub: 'user_12345678', exp: 2000000300, iat: 1999999990, nbf: 1999999990, ...overrides },
  ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url'));
  const payload = parts.join('.');
  return payload + '.' + sign('RSA-SHA256', Buffer.from(payload), privateKey).toString('base64url');
}

test('verified token resolves exactly the durable principal, never an email', async () => {
  const subjects = [];
  const decision = await resolveVerifiedClerkPrincipal(token({ email: 'attacker@example.test' }), trust, {
    resolveActiveClerkPrincipal: async subject => { subjects.push(subject); return principalId; },
  });
  assert.deepEqual(decision, { authorized: true, principalId });
  assert.deepEqual(subjects, ['user_12345678']);
});

test('invalid token never queries identity storage', async () => {
  let called = false;
  const decision = await resolveVerifiedClerkPrincipal('forged', trust, {
    resolveActiveClerkPrincipal: async () => { called = true; return principalId; },
  });
  assert.deepEqual(decision, { authorized: false, reason: 'invalid-token' });
  assert.equal(called, false);
});

test('missing, malformed and unavailable identity mapping all fail closed', async () => {
  for (const value of [null, 'not-a-uuid']) {
    assert.deepEqual(await resolveVerifiedClerkPrincipal(token(), trust, {
      resolveActiveClerkPrincipal: async () => value,
    }), { authorized: false, reason: 'unlinked-identity' });
  }
  assert.deepEqual(await resolveVerifiedClerkPrincipal(token(), trust, {
    resolveActiveClerkPrincipal: async () => { throw new Error('private database error'); },
  }), { authorized: false, reason: 'identity-unavailable' });
});

test('wrong issuer, origin and expired tokens fail closed', async () => {
  for (const claims of [{ iss: 'https://wrong.example.test' }, { azp: 'https://evil.example.test' }, { exp: 1999999999 }]) {
    assert.deepEqual(await resolveVerifiedClerkPrincipal(token(claims), trust, {
      resolveActiveClerkPrincipal: async () => principalId,
    }), { authorized: false, reason: 'invalid-token' });
  }
});

test('wrong audience, missing authorized party, future token and unknown key fail closed', async () => {
  for (const claims of [
    { aud: 'another-service' },
    { aud: ['another-service'] },
    { azp: undefined },
    { nbf: 2000000001 },
    { iat: 2000000001 },
    { sub: 'attacker@example.test' },
  ]) {
    let queried = false;
    const decision = await resolveVerifiedClerkPrincipal(token(claims), trust, {
      resolveActiveClerkPrincipal: async () => { queried = true; return principalId; },
    });
    assert.deepEqual(decision, { authorized: false, reason: 'invalid-token' });
    assert.equal(queried, false);
  }
});

test('verified identity does not accept client-supplied principal identifiers', async () => {
  const clientPrincipal = '00000000-0000-4000-8000-000000000099';
  const decision = await resolveVerifiedClerkPrincipal(token({ principalId: clientPrincipal }), trust, {
    resolveActiveClerkPrincipal: async () => principalId,
  });
  assert.deepEqual(decision, { authorized: true, principalId });
  assert.notEqual(decision.principalId, clientPrincipal);
});
