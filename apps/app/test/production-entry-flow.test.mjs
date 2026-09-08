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
    assert.match(source, /AuthRuntimeDiagnostic/);
    assert.match(source, /fallbackRedirectUrl="\/auth\/complete"/);
    assert.match(source, /fallback=\{<AuthMountFallback \/>\}/);
    assert.doesNotMatch(source, /min-h-\[(?:420|460)px\]/);
    assert.match(source, /role="status"/);
    assert.match(source, /aria-live="polite"/);
  }
  assert.match(signIn, /signUpUrl="\/auth\/sign-up"/);
  assert.match(signUp, /signInUrl="\/auth\/sign-in"/);
});

test('temporary auth diagnostics distinguish Clerk loading, loaded, degraded and failed states', () => {
  const diagnostic = read('app/(auth)/components/AuthRuntimeDiagnostic.tsx');
  for (const control of ['ClerkLoading', 'ClerkLoaded', 'ClerkDegraded', 'ClerkFailed']) {
    assert.match(diagnostic, new RegExp(`<${control}>`));
  }
  for (const state of ['loading', 'loaded', 'degraded', 'failed']) {
    assert.match(diagnostic, new RegExp(`state="${state}"`));
  }
  assert.match(diagnostic, /data-auth-runtime-state=\{state\}/);
  assert.doesNotMatch(diagnostic, /publishable|secret|token|cookie|userId|sessionId/i);
});

test('ClerkProvider is mounted inside body so the document root remains valid Next.js markup', () => {
  const layout = read('app/layout.tsx');
  const htmlIndex = layout.indexOf('<html');
  const bodyIndex = layout.indexOf('<body');
  const providerIndex = layout.indexOf('<ClerkProvider');
  const providerCloseIndex = layout.indexOf('</ClerkProvider>');
  const bodyCloseIndex = layout.indexOf('</body>');

  assert.ok(htmlIndex >= 0);
  assert.ok(bodyIndex > htmlIndex);
  assert.ok(providerIndex > bodyIndex);
  assert.ok(providerCloseIndex > providerIndex);
  assert.ok(bodyCloseIndex > providerCloseIndex);
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

test('production auth environment contract is explicit and fails closed on invalid origins', () => {
  const env = read('.env.example');
  const runtime = read('lib/runtime-config.ts');
  const layout = read('app/layout.tsx');
  for (const expected of [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up',
    'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/complete',
    'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/auth/complete',
    'NEXT_PUBLIC_SITE_URL=https://app.neptlium.com',
    'NEPTLIUM_API_URL=https://api.neptlium.com',
  ]) assert.ok(env.includes(expected), `missing environment contract: ${expected}`);
  assert.match(runtime, /VERCEL_ENV !== 'production'/);
  assert.match(runtime, /https:\/\/app\.neptlium\.com/);
  assert.match(runtime, /https:\/\/api\.neptlium\.com/);
  assert.match(runtime, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.match(runtime, /CLERK_SECRET_KEY/);
  assert.match(layout, /assertProductionRuntimeConfig\(\)/);
  assert.doesNotMatch(runtime, /console\.|process\.stdout|process\.stderr/);
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
