import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('application root is the server-side Clerk state router', () => {
  const page = read('app/page.tsx');
  assert.match(page, /from '@clerk\/nextjs\/server'/);
  assert.match(page, /await auth\(\)/);
  assert.match(page, /redirect\(userId \? "\/auth\/complete" : "\/auth\/sign-in"\)/);
  assert.doesNotMatch(page, /useEffect|localStorage|window\.location/);
});

test('Clerk sign-in and sign-up always complete through the authoritative completion route', () => {
  const signIn = read('app/auth/sign-in/page.tsx');
  const signUp = read('app/auth/sign-up/page.tsx');
  for (const source of [signIn, signUp]) {
    assert.match(source, /AuthShell/);
    assert.match(source, /fallbackRedirectUrl="\/auth\/complete"/);
  }
  assert.match(signIn, /signUpUrl="\/auth\/sign-up"/);
  assert.match(signUp, /signInUrl="\/auth\/sign-in"/);
});

test('auth completion resolves bootstrap before canonical account context and redirects outside error handling', () => {
  const complete = read('app/auth/complete/page.tsx');
  assert.match(complete, /bootstrapClerkIdentity\(\)/);
  assert.match(complete, /getAccountContext\(\)/);
  assert.match(complete, /destination = '\/auth\/link-existing'/);
  assert.match(complete, /destination = '\/dashboard'/);
  assert.match(complete, /destination = '\/onboarding'/);
  assert.match(complete, /redirect\(destination\)/);
  assert.match(complete, /next\/navigation redirects throw internally/);
  assert.match(complete, /We could not complete secure account setup\. Please try again\./);
  assert.doesNotMatch(complete, /JWT|Bearer |CLERK_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});

test('protected customer routes remain protected by Clerk middleware', () => {
  const proxy = read('proxy.ts');
  assert.match(proxy, /createRouteMatcher\(\['\/dashboard\(\.\*\)', '\/onboarding\(\.\*\)'\]\)/);
  assert.match(proxy, /await auth\.protect\(\)/);
});

test('production auth environment contract is explicit', () => {
  const env = read('.env.example');
  for (const expected of [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up',
    'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/complete',
    'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/auth/complete',
    'NEXT_PUBLIC_SITE_URL=https://app.neptlium.com',
    'NEPTLIUM_API_URL=https://api.neptlium.com',
  ]) assert.match(env, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('API client is server-only, uses Clerk bearer authentication, request correlation and bounded timeouts', () => {
  const client = read('lib/api/client.ts');
  assert.match(client, /import 'server-only'/);
  assert.match(client, /getToken\(\)/);
  assert.match(client, /authorization: `Bearer \$\{token\}`/);
  assert.match(client, /'x-request-id': requestId/);
  assert.match(client, /8_000/);
  assert.match(client, /api_timeout/);
  assert.match(client, /api_unavailable/);
});
