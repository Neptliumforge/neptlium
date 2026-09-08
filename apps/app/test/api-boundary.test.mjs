import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  'app/dashboard/transactions/page.tsx',
  'app/dashboard/notifications/page.tsx',
  'app/dashboard/documents/page.tsx',
  'app/dashboard/settings/page.tsx',
];

test('customer product pages do not directly access Supabase product tables or storage', () => {
  for (const path of dashboardPages) {
    const source = read(path);
    assert.doesNotMatch(source, /createClient\(|@supabase\/supabase-js|\.from\(|\.storage\./, path);
  }
});

test('server-only API client is the customer product data boundary', () => {
  const source = read('lib/api/client.ts');
  const financial = read('lib/api/financial.ts');
  const walletActions = read('app/dashboard/wallet/actions.ts');

  assert.match(source, /import 'server-only'/);
  assert.match(source, /NEPTLIUM_API_URL/);
  assert.match(source, /api_not_configured/);

  // Clerk identity and request correlation are transport-owned.
  assert.match(source, /new Headers\(init\.headers\)/);
  assert.match(source, /headers\.set\('authorization', `Bearer \$\{token\}`\)/);
  assert.match(source, /headers\.set\('x-request-id', requestId\)/);

  // Every governed mutation receives an idempotency key centrally while
  // explicitly supplied domain keys remain preserved.
  assert.match(source, /!headers\.has\('idempotency-key'\)/);
  assert.match(source, /headers\.set\('idempotency-key', randomUUID\(\)\)/);

  assert.match(source, /cache: 'no-store'/);
  assert.match(source, /8_000/);
  assert.match(source, /method === 'GET' \? 2 : 1/);

  // Customer state routes remain server-only API contracts.
  assert.match(source, /\/v1\/customer\/overview/);
  assert.match(source, /\/v1\/customer\/portfolio/);
  assert.match(source, /\/v1\/customer\/treasury/);
  assert.match(source, /\/v1\/customer\/allocation/);
  assert.match(source, /\/v1\/capital-activity/);
  assert.match(source, /\/v1\/notifications/);
  assert.match(source, /\/v1\/documents/);
  assert.match(source, /\/v1\/account\/context/);
  assert.match(source, /\/v1\/account\/settings/);
  assert.match(source, /\/v1\/account\/onboarding-draft/);

  // Production financial state comes from the canonical LIVE financial layer,
  // never the retired Base-Sepolia/testnet observation contract.
  assert.doesNotMatch(source, /BASE-SEPOLIA|testnet/);
  assert.match(financial, /\/v1\/capital-account\/balances/);
  assert.match(financial, /NEPTLIUM_CANONICAL_LEDGER/);
  assert.match(financial, /\/v1\/funding\/capabilities/);
  assert.match(financial, /\/v1\/funding\/activity/);
  assert.match(financial, /\/v1\/treasury\/transfer-capabilities/);
  assert.match(financial, /\/v1\/treasury\/transfers/);
  assert.match(financial, /environment: 'LIVE'/);

  // Product actions consume the financial domain boundary instead of
  // owning raw transport routes or manufacturing request identity.
  assert.match(walletActions, /createFundingIntent/);
  assert.match(walletActions, /getDepositInstructionsForIntent/);
  assert.match(walletActions, /createTransferAlias/);
  assert.doesNotMatch(walletActions, /apiRequest/);
  assert.doesNotMatch(walletActions, /\/v1\//);
  assert.doesNotMatch(walletActions, /globalThis\.crypto\.randomUUID/);
});

test('production runtime configuration names the canonical API origin explicitly', () => {
  const envExample = read('.env.example');
  assert.match(envExample, /NEPTLIUM_API_URL=https:\/\/api\.neptlium\.com/);
  assert.match(envExample, /NEXT_PUBLIC_SITE_URL=https:\/\/app\.neptlium\.com/);
});

test('legacy Supabase access is confined to the one-time identity migration route', () => {
  const route = read('app/api/auth/link-existing/route.ts');
  assert.match(route, /\/auth\/v1\/token\?grant_type=password/);
  assert.match(route, /\/v1\/auth\/link-clerk/);
  assert.doesNotMatch(route, /\/rest\/v1\/|\/storage\/v1\//);
  assert.doesNotMatch(route, /SUPABASE_SERVICE_ROLE_KEY/);
});
