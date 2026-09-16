import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('application root uses Supabase Auth and routes users by session state', () => {
  const page = read('app/page.tsx');
  assert.match(page, /createSupabaseServerClient/);
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /redirect\(user \? '\/dashboard' : '\/auth\/sign-in'\)/);
});

test('sign-in and sign-up use the shared Supabase Auth form', () => {
  const signIn = read('app/auth/sign-in/page.tsx');
  const signUp = read('app/auth/sign-up/page.tsx');
  assert.match(signIn, /SupabaseAuthForm/);
  assert.match(signIn, /mode="sign-in"/);
  assert.match(signUp, /SupabaseAuthForm/);
  assert.match(signUp, /mode="sign-up"/);
  const form = read('app/(auth)/components/SupabaseAuthForm.tsx');
  const callback = read('app/auth/callback/route.ts');
  assert.match(form, /href="\/forgot-password"/);
  assert.match(form, /safeInternalPath/);
  assert.match(callback, /safeInternalPath/);
});

test('individual entry exposes the canonical investor navigation and truthful Invest route', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  const invest = read('app/dashboard/invest/page.tsx');
  const experience = read('components/product/OperatingExperience.tsx');
  for (const label of ['Overview', 'Portfolio', 'Invest', 'Activity', 'More']) {
    assert.match(nav, new RegExp(`label: '${label}'`));
  }
  assert.match(invest, /InvestExperience/);
  assert.match(experience, /Investment discovery is not available yet/);
  assert.match(experience, /planned categories as current inventory/);
});

test('no legacy auth-completion bridge remains in the production entry flow', () => {
  assert.equal(existsSync(resolve(root, 'app/auth/complete/page.tsx')), false);
  assert.equal(existsSync(resolve(root, 'app/api/auth/link-existing/route.ts')), false);
  assert.equal(existsSync(resolve(root, 'app/auth/link-existing/page.tsx')), false);
});

test('protected customer routes remain protected by Supabase session middleware', () => {
  const proxy = read('proxy.ts');
  assert.match(proxy, /refreshSupabaseSession/);
  assert.match(proxy, /protectedPrefixes/);
  assert.match(proxy, /\/auth\/sign-in/);
  assert.match(proxy, /NextResponse\.redirect/);
});

test('production auth environment is Supabase-only and browser-safe without eager public auth validation', () => {
  const env = read('.env.example');
  const runtime = read('lib/runtime-config.ts');
  for (const expected of [
    'NEXT_PUBLIC_SUPABASE_URL=',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=',
    'NEXT_PUBLIC_SITE_URL=https://app.neptlium.com',
    'NEPTLIUM_API_URL=https://api.neptlium.com',
  ])
    assert.ok(env.includes(expected), `missing environment contract: ${expected}`);
  assert.doesNotMatch(env, /SERVICE_ROLE/);
  assert.doesNotMatch(runtime, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.doesNotMatch(runtime, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(runtime, /NEXT_PUBLIC_SITE_URL/);
  assert.match(runtime, /NEPTLIUM_API_URL/);
});
