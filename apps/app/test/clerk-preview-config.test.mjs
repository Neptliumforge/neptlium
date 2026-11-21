import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clerkPreviewConfig, isClerkPreviewPath } from '../lib/auth/clerk-preview-config.ts';

const env = {
  VERCEL_ENV: 'preview',
  NEPTLIUM_API_AUTH_PROVIDER: 'clerk-preview',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_fixture',
  CLERK_SECRET_KEY: 'sk_test_fixture',
  NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN: 'https://app-preview.example.test',
  NEPTLIUM_CLERK_PREVIEW_API_ORIGIN: 'https://api-preview.example.test',
  NEPTLIUM_CLERK_PREVIEW_TOKEN_TEMPLATE: 'neptlium-preview',
};

test('Clerk Preview requires test keys, exact HTTPS origins and a JWT template', () => {
  assert.equal(clerkPreviewConfig(env)?.template, 'neptlium-preview');
  for (const overrides of [
    { VERCEL_ENV: 'production' },
    { VERCEL_TARGET_ENV: 'production' },
    { NEPTLIUM_API_AUTH_PROVIDER: undefined },
    { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_fixture' },
    { CLERK_SECRET_KEY: 'sk_live_fixture' },
    { NEPTLIUM_CLERK_PREVIEW_API_ORIGIN: 'https://api-preview.example.test/other' },
    { NEPTLIUM_CLERK_PREVIEW_API_ORIGIN: env.NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN },
    { NEPTLIUM_CLERK_PREVIEW_TOKEN_TEMPLATE: ' ' },
  ]) assert.equal(clerkPreviewConfig({ ...env, ...overrides }), undefined);
});

test('Clerk middleware is scoped to the Preview route subtree', () => {
  for (const path of ['/preview/clerk', '/preview/clerk/sign-in/sso-callback', '/preview/clerk/session']) {
    assert.equal(isClerkPreviewPath(path), true);
  }
  for (const path of ['/preview/clerk-other', '/dashboard', '/auth/sign-in']) {
    assert.equal(isClerkPreviewPath(path), false);
  }
});

test('Preview session page acquires a Clerk bearer server-side and uses the existing API adapter', () => {
  const page = readFileSync(new URL('../app/preview/clerk/session/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /from '@clerk\/nextjs\/server'/);
  assert.match(page, /session\.getToken\(\{ template: config\.template \}\)/);
  assert.match(page, /resolvePreviewClerkApiSession\(tenant,/);
  assert.doesNotMatch(page, /verified\.(bearerToken|principalId)/);
});
