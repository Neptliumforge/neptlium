import test from 'node:test';
import assert from 'node:assert/strict';
import { selectCustomerAuthMode } from '../lib/auth/customer-auth-mode.ts';

const certified = {
  NEPTLIUM_AUTH_PROVIDER: 'clerk',
  NEPTLIUM_CLERK_CUTOVER_APPROVED: 'true',
  NEPTLIUM_IDENTITY_MAPPING_VERIFIED: 'true',
  NEPTLIUM_AUTH_ROLLBACK_VERIFIED: 'true',
  NEPTLIUM_CLERK_JWT_VERIFIER_VERIFIED: 'true',
  NEPTLIUM_CLERK_TENANT_ISOLATION_VERIFIED: 'true',
  NEPTLIUM_CLERK_ACCOUNT_BOOTSTRAP_VERIFIED: 'true',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_dummy_test_only',
  CLERK_SECRET_KEY: 'sk_live_dummy_test_only',
  NEXT_PUBLIC_SITE_URL: 'https://app.neptlium.com',
};

test('keeps existing provider when no Clerk release is approved', () => {
  assert.equal(selectCustomerAuthMode({}).provider, 'supabase');
});
test('does not activate Clerk with credentials alone', () => {
  const result = selectCustomerAuthMode({ ...certified, NEPTLIUM_CLERK_CUTOVER_APPROVED: undefined });
  assert.equal(result.provider, 'supabase');
  assert.equal(result.clerkDecision.allowed, false);
});
test('does not activate Clerk without verified identity mapping', () => {
  assert.equal(selectCustomerAuthMode({ ...certified, NEPTLIUM_IDENTITY_MAPPING_VERIFIED: undefined }).provider, 'supabase');
});
test('does not activate Clerk without JWT and tenant certifications', () => {
  assert.equal(selectCustomerAuthMode({ ...certified, NEPTLIUM_CLERK_JWT_VERIFIER_VERIFIED: undefined }).provider, 'supabase');
  assert.equal(selectCustomerAuthMode({ ...certified, NEPTLIUM_CLERK_TENANT_ISOLATION_VERIFIED: undefined }).provider, 'supabase');
});
test('selects Clerk only after all production cutover prerequisites pass', () => {
  assert.deepEqual(selectCustomerAuthMode(certified), { provider: 'clerk', clerkDecision: { allowed: true } });
});
