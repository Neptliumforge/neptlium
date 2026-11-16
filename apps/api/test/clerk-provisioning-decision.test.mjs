import test from 'node:test';
import assert from 'node:assert/strict';
import { decideClerkPreviewProvisioning } from '../dist/clerk-provisioning-decision.js';

const subject = 'user_12345678';
const principalId = '00000000-0000-4000-8000-000000000001';
const lookup = (links) => ({ findActiveLinks: async () => links });

test('existing active durable identity is reused', async () => {
  assert.deepEqual(await decideClerkPreviewProvisioning('preview', subject,
    lookup([{ principalId, principalActive: true }])), { action: 'existing', principalId });
});

test('no existing link requests new account but never writes one', async () => {
  assert.deepEqual(await decideClerkPreviewProvisioning('preview', subject, lookup([])),
    { action: 'create-new' });
});

test('ambiguous, inactive and malformed links fail closed', async () => {
  assert.deepEqual(await decideClerkPreviewProvisioning('preview', subject,
    lookup([{ principalId, principalActive: true }, { principalId, principalActive: true }])),
    { action: 'deny', reason: 'ambiguous-link' });
  for (const link of [{ principalId, principalActive: false }, { principalId: 'bad', principalActive: true }]) {
    assert.deepEqual(await decideClerkPreviewProvisioning('preview', subject, lookup([link])),
      { action: 'deny', reason: 'inactive-principal' });
  }
});

test('production denies without calling storage', async () => {
  let calls = 0;
  const store = { findActiveLinks: async () => { calls++; return []; } };
  assert.deepEqual(await decideClerkPreviewProvisioning('production', subject, store),
    { action: 'deny', reason: 'invalid-subject' });
  assert.equal(calls, 0);
});

test('invalid subjects and storage errors fail closed', async () => {
  assert.deepEqual(await decideClerkPreviewProvisioning('preview', 'invalid', lookup([])),
    { action: 'deny', reason: 'invalid-subject' });
  assert.deepEqual(await decideClerkPreviewProvisioning('preview', subject,
    { findActiveLinks: async () => { throw new Error('offline'); } }),
    { action: 'deny', reason: 'storage-unavailable' });
});
