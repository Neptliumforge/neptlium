import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('application root uses Clerk directly and signed-in users enter the dashboard', () => {
  const page = read('app/page.tsx');
  assert.match(page, /from '@clerk\/nextjs\/server'/);
  assert.match(page, /await auth\(\)/);
  assert.match(page, /if \(userId\) redirect\('\/dashboard'\)/);
  assert.match(page, /<SignIn/);
  assert.match(page, /fallbackRedirectUrl="\/auth\/complete"/);
});

test('Clerk sign-in and sign-up complete through the authoritative Clerk bootstrap route', () => {
  const signIn = read('app/auth/sign-in/page.tsx');
  const signUp = read('app/auth/sign-up/page.tsx');
  for (const source of [signIn, signUp]) {
    assert.match(source, /fallbackRedirectUrl="\/auth\/complete"/);
    assert.match(source, /role="status"/);
    assert.match(source, /aria-live="polite"/);
  }
});

test('auth completion never opens a legacy authentication provider', () => {
  const complete = read('app/auth/complete/page.tsx');
  assert.match(complete, /bootstrapClerkIdentity\(\)/);
  assert.match(complete, /getAccountContext\(\)/);
  assert.match(complete, /destination = '\/dashboard'/);
  assert.match(complete, /destination = '\/onboarding'/);
  assert.match(complete, /No legacy password is required/);
  assert.doesNotMatch(complete, /\/auth\/link-existing|NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE_ROLE_KEY/);
});

test('protected customer routes remain protected by Clerk middleware', () => {
  const proxy = read('proxy.ts');
  assert.match(proxy, /clerkMiddleware/);
  assert.match(proxy, /await auth\.protect\(\)/);
});

test('production auth environment is Clerk-only', () => {
  const env = read('.env.example');
  const runtime = read('lib/runtime-config.ts');
  for (const expected of [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up',
    'NEXT_PUBLIC_SITE_URL=https://app.neptlium.com',
    'NEPTLIUM_API_URL=https://api.neptlium.com',
  ]) assert.ok(env.includes(expected), `missing environment contract: ${expected}`);
  assert.doesNotMatch(env, /SUPABASE/);
  assert.match(runtime, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.match(runtime, /CLERK_SECRET_KEY/);
});
