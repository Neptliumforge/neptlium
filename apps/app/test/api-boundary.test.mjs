import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const dashboardPages = [
  'app/dashboard/page.tsx',
  'app/dashboard/portfolio/page.tsx',
  'app/dashboard/capital-account/page.tsx',
  'app/dashboard/wallet/page.tsx',
  'app/dashboard/treasury/page.tsx',
  'app/dashboard/allocations/page.tsx',
  'app/dashboard/company-intelligence/page.tsx',
  'app/dashboard/transactions/page.tsx',
  'app/dashboard/notifications/page.tsx',
  'app/dashboard/documents/page.tsx',
  'app/dashboard/settings/page.tsx',
];

test('customer product pages do not directly access database product tables or storage', () => {
  for (const path of dashboardPages) {
    const source = read(path);
    assert.doesNotMatch(source, /createClient\(|@supabase\/supabase-js|\.from\(|\.storage\./, path);
  }
});

test('server-only API client owns Supabase bearer authentication and customer data transport', () => {
  const source = read('lib/api/client.ts');
  assert.match(source, /import 'server-only'/);
  assert.match(source, /createSupabaseServerClient/);
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /supabase\.auth\.getSession\(\)/);
  assert.match(source, /headers\.set\('authorization', `Bearer \$\{token\}`\)/);
  assert.match(source, /headers\.set\('x-request-id', requestId\)/);
  assert.match(source, /cache: 'no-store'/);
  assert.match(source, /8_000/);
  for (const route of [
    'customer/overview',
    'customer/portfolio',
    'customer/treasury',
    'customer/allocation',
    'capital-activity',
    'notifications',
    'documents',
    'account/context',
    'account/settings',
  ]) {
    assert.ok(source.includes(`/v1/${route}`));
  }
});

test('production application runtime uses Supabase Auth without a legacy account-link bridge', () => {
  const env = read('.env.example');
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(env, /SERVICE_ROLE/);
  assert.equal(existsSync(resolve(root, 'app/api/auth/link-existing/route.ts')), false);
  assert.equal(existsSync(resolve(root, 'app/auth/link-existing/page.tsx')), false);
});
