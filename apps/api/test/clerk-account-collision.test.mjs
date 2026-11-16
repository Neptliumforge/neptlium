import test from 'node:test';
import assert from 'node:assert/strict';
import { checkClerkNewAccountCollision } from '../dist/clerk-account-collision.js';

test('new verified email may proceed to a separate atomic creation command', async () => {
  const queried = [];
  const result = await checkClerkNewAccountCollision('preview', ' NEW@Example.test ', {
    findProfilesByNormalizedEmail: async email => { queried.push(email); return []; },
  });
  assert.deepEqual(result, { allowed: true });
  assert.deepEqual(queried, ['new@example.test']);
});

test('matching existing account requires separate proof of ownership, never auto-links', async () => {
  const result = await checkClerkNewAccountCollision('preview', 'existing@example.test', {
    findProfilesByNormalizedEmail: async () => [{ id: 'existing-principal' }],
  });
  assert.deepEqual(result, { allowed: false, reason: 'existing-account-link-required' });
  assert.equal('principalId' in result, false);
});

test('ambiguous matches also deny and disclose no identity', async () => {
  assert.deepEqual(await checkClerkNewAccountCollision('preview', 'existing@example.test', {
    findProfilesByNormalizedEmail: async () => [{ id: 'one' }, { id: 'two' }],
  }), { allowed: false, reason: 'existing-account-link-required' });
});

test('production and invalid emails fail before storage', async () => {
  let calls = 0;
  const store = { findProfilesByNormalizedEmail: async () => { calls++; return []; } };
  assert.deepEqual(await checkClerkNewAccountCollision('production', 'valid@example.test', store),
    { allowed: false, reason: 'not-preview' });
  assert.deepEqual(await checkClerkNewAccountCollision('preview', 'invalid', store),
    { allowed: false, reason: 'invalid-email' });
  assert.equal(calls, 0);
});

test('storage outage and invalid results fail closed', async () => {
  assert.deepEqual(await checkClerkNewAccountCollision('preview', 'valid@example.test', {
    findProfilesByNormalizedEmail: async () => { throw new Error('unavailable'); },
  }), { allowed: false, reason: 'storage-unavailable' });
  assert.deepEqual(await checkClerkNewAccountCollision('preview', 'valid@example.test', {
    findProfilesByNormalizedEmail: async () => null,
  }), { allowed: false, reason: 'storage-unavailable' });
});
