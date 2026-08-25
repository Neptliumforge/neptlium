import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Clerk completion routes existing accounts into the one-time linking flow', () => {
  const complete = read('app/auth/complete/page.tsx');
  assert.match(complete, /bootstrapClerkIdentity/);
  assert.match(complete, /status === 'link_required'/);
  assert.match(complete, /redirect\('\/auth\/link-existing'\)/);
});

test('existing-account bridge verifies legacy credentials then links through apps\/api', () => {
  const route = read('app/api/auth/link-existing/route.ts');
  assert.match(route, /\/auth\/v1\/token\?grant_type=password/);
  assert.match(route, /\/v1\/auth\/link-clerk/);
  assert.match(route, /x-clerk-session-token/);
  assert.match(route, /idempotency-key/);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY|CIRCLE_API_KEY|STRIPE_SECRET_KEY/);
});

test('identity linking UI does not expose product or financial data access', () => {
  const form = read('app/auth/link-existing/ExistingAccountLinkForm.tsx');
  assert.match(form, /\/api\/auth\/link-existing/);
  assert.doesNotMatch(form, /\/v1\/(?:customer|capital-account|capital-activity|notifications|documents)/);
  assert.doesNotMatch(form, /balance|transaction|portfolio|treasury|allocation/i);
});
