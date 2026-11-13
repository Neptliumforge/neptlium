import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateClerkCutover } from '../lib/clerk-cutover.ts';

const ready = {
  NEPTLIUM_AUTH_PROVIDER: 'clerk',
  NEPTLIUM_CLERK_CUTOVER_APPROVED: 'true',
  NEPTLIUM_IDENTITY_MAPPING_VERIFIED: 'true',
  NEPTLIUM_AUTH_ROLLBACK_VERIFIED: 'true',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_dummy_test_only',
  CLERK_SECRET_KEY: 'sk_live_dummy_test_only',
  NEXT_PUBLIC_SITE_URL: 'https://app.neptlium.com',
};

test('defaults to blocked', () => {
  assert.deepEqual(evaluateClerkCutover({}), { allowed: false, reason: 'clerk-provider-not-selected' });
});
test('blocks unapproved cutover', () => {
  assert.equal(evaluateClerkCutover({ ...ready, NEPTLIUM_CLERK_CUTOVER_APPROVED: undefined }).allowed, false);
});
test('blocks unverified identity mapping', () => {
  assert.equal(evaluateClerkCutover({ ...ready, NEPTLIUM_IDENTITY_MAPPING_VERIFIED: undefined }).allowed, false);
});
test('blocks missing rollback proof', () => {
  assert.equal(evaluateClerkCutover({ ...ready, NEPTLIUM_AUTH_ROLLBACK_VERIFIED: undefined }).allowed, false);
});
test('blocks test-mode credentials', () => {
  assert.equal(evaluateClerkCutover({ ...ready, CLERK_SECRET_KEY: 'sk_test_dummy' }).allowed, false);
});
test('blocks wrong production origin', () => {
  assert.equal(evaluateClerkCutover({ ...ready, NEXT_PUBLIC_SITE_URL: 'https://apps.neptlium.com' }).allowed, false);
});
test('passes prerequisites only when explicitly satisfied', () => {
  assert.deepEqual(evaluateClerkCutover(ready), { allowed: true });
});
