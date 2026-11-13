import test from 'node:test';
import assert from 'node:assert/strict';
import { clerkApiReadiness } from '../dist/clerk-token-boundary.js';

const ready = {
  NEPTLIUM_API_AUTH_PROVIDER: 'clerk-preview',
  VERCEL_ENV: 'preview',
  NEPTLIUM_CLERK_API_VERIFIER_TESTED: 'true',
  NEPTLIUM_CLERK_IDENTITY_RESOLVER_TESTED: 'true',
  NEPTLIUM_CLERK_TENANT_ISOLATION_TESTED: 'true',
};

test('Clerk API mode defaults to disabled', () => {
  assert.equal(clerkApiReadiness({}).ready, false);
});
test('production cannot enable preview Clerk API mode', () => {
  assert.deepEqual(clerkApiReadiness({ ...ready, VERCEL_ENV: 'production' }), { ready: false, reason: 'not-preview' });
});
test('independent JWT verification is mandatory', () => {
  assert.equal(clerkApiReadiness({ ...ready, NEPTLIUM_CLERK_API_VERIFIER_TESTED: undefined }).ready, false);
});
test('durable identity mapping is mandatory', () => {
  assert.equal(clerkApiReadiness({ ...ready, NEPTLIUM_CLERK_IDENTITY_RESOLVER_TESTED: undefined }).ready, false);
});
test('tenant isolation proof is mandatory', () => {
  assert.equal(clerkApiReadiness({ ...ready, NEPTLIUM_CLERK_TENANT_ISOLATION_TESTED: undefined }).ready, false);
});
test('all readiness prerequisites can be expressed without enabling authentication', () => {
  assert.deepEqual(clerkApiReadiness(ready), { ready: true });
});
