import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyClerkJwtRs256 } from '../dist/clerk-jwt-verifier.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' };
const now = 2_000_000_000;
const trust = { issuer: 'https://clerk-preview.example.test', audience: 'neptlium-api-preview', authorizedParties: ['https://preview.neptlium.test'], keys: { 'key-1': jwk }, nowSeconds: now };
const claims = { iss: trust.issuer, aud: trust.audience, azp: trust.authorizedParties[0], sub: 'user_12345678', exp: now + 300, nbf: now - 10, iat: now - 10 };

function token(payload = claims, header = { alg: 'RS256', kid: 'key-1', typ: 'JWT' }) {
  const body = [header, payload].map((v) => Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
  return body + '.' + sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url');
}

test('accepts correctly signed preview token with required claims', () => {
  assert.deepEqual(verifyClerkJwtRs256(token(), trust), { valid: true, subject: claims.sub });
});
test('rejects tampered signature', () => {
  const t = token(); const parts = t.split('.');
  parts[2] = Buffer.alloc(256, 0).toString('base64url');
  assert.equal(verifyClerkJwtRs256(parts.join('.'), trust).valid, false);
});
test('rejects wrong issuer', () => {
  assert.equal(verifyClerkJwtRs256(token({ ...claims, iss: 'https://attacker.test' }), trust).valid, false);
});
test('rejects wrong audience', () => {
  assert.equal(verifyClerkJwtRs256(token({ ...claims, aud: 'another-api' }), trust).valid, false);
});
test('rejects expired token', () => {
  assert.equal(verifyClerkJwtRs256(token({ ...claims, exp: now }), trust).valid, false);
});
test('rejects not-yet-valid token', () => {
  assert.equal(verifyClerkJwtRs256(token({ ...claims, nbf: now + 60 }), trust).valid, false);
});
test('rejects missing mandatory claims', () => {
  const { iat, ...missing } = claims;
  assert.equal(verifyClerkJwtRs256(token(missing), trust).valid, false);
});
test('rejects untrusted key id', () => {
  assert.equal(verifyClerkJwtRs256(token(claims, { alg: 'RS256', kid: 'unknown', typ: 'JWT' }), trust).valid, false);
});
test('rejects unsupported algorithms', () => {
  assert.equal(verifyClerkJwtRs256(token(claims, { alg: 'none', kid: 'key-1', typ: 'JWT' }), trust).valid, false);
});
test('rejects malformed token', () => {
  assert.equal(verifyClerkJwtRs256('bad.token', trust).valid, false);
});

test('rejects missing authorized party', () => {
  const { azp, ...missing } = claims;
  assert.equal(verifyClerkJwtRs256(token(missing), trust).valid, false);
});
test('rejects token minted for a different origin', () => {
  assert.equal(verifyClerkJwtRs256(token({ ...claims, azp: 'https://attacker.test' }), trust).valid, false);
});
test('rejects empty trusted origin allowlist', () => {
  assert.equal(verifyClerkJwtRs256(token(), { ...trust, authorizedParties: [] }).valid, false);
});
test('rejects insecure trusted origin', () => {
  assert.equal(verifyClerkJwtRs256(token(), { ...trust, authorizedParties: ['http://preview.neptlium.test'] }).valid, false);
});
