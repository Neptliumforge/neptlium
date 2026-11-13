import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVerifiedIdentityLink } from '../lib/auth/identity-link.ts';

const subject = 'user_12345678';
const userId = 'b1baf1c0-18a4-4a3e-8c33-cd4b50dbbf6c';
const verified = { clerkSubject: subject, supabaseUserId: userId, verified: true, revoked: false };

test('rejects absent or malformed Clerk subjects', () => {
  assert.equal(resolveVerifiedIdentityLink(null, [verified]).status, 'denied');
  assert.equal(resolveVerifiedIdentityLink('someone@example.com', [verified]).status, 'denied');
});
test('rejects missing mapping', () => {
  assert.deepEqual(resolveVerifiedIdentityLink(subject, []), { status: 'denied', reason: 'missing-link' });
});
test('rejects duplicate mappings even when identical', () => {
  assert.deepEqual(resolveVerifiedIdentityLink(subject, [verified, verified]), { status: 'denied', reason: 'ambiguous-link' });
});
test('rejects unverified mapping', () => {
  assert.deepEqual(resolveVerifiedIdentityLink(subject, [{ ...verified, verified: false }]), { status: 'denied', reason: 'unverified-link' });
});
test('rejects revoked mapping', () => {
  assert.deepEqual(resolveVerifiedIdentityLink(subject, [{ ...verified, revoked: true }]), { status: 'denied', reason: 'revoked-link' });
});
test('rejects malformed internal user ID', () => {
  assert.equal(resolveVerifiedIdentityLink(subject, [{ ...verified, supabaseUserId: 'other-user' }]).status, 'denied');
});
test('accepts exactly one independently verified link', () => {
  assert.deepEqual(resolveVerifiedIdentityLink(subject, [verified]), { status: 'linked', supabaseUserId: userId });
});
test('never resolves an unrelated subject', () => {
  assert.equal(resolveVerifiedIdentityLink('user_87654321', [verified]).status, 'denied');
});
