import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const scanRoots = ['app', 'components', 'modules', 'lib'];
const sourceExtensions = new Set(['.ts', '.tsx']);

function filesUnder(directory) {
  const output = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) output.push(...filesUnder(full));
    else if (sourceExtensions.has(extname(entry))) output.push(full);
  }
  return output;
}

const sourceFiles = scanRoots.flatMap((directory) => filesUnder(join(appRoot, directory)));
const normalize = (file) => relative(appRoot, file).split(sep).join('/');
const source = (file) => readFileSync(file, 'utf8');

function isAuthSessionException(path) {
  return (
    path === 'app/page.tsx' ||
    path === 'lib/api/client.ts' ||
    path === 'lib/auth/session.ts' ||
    path.startsWith('app/(auth)/') ||
    path.startsWith('app/auth/') ||
    path === 'app/dashboard/settings/MfaEnrollment.tsx' ||
    path === 'app/dashboard/settings/actions.ts' ||
    path === 'components/security/actions.ts' ||
    path === 'lib/security/events.ts' ||
    path === 'lib/security/deviceCookie.ts'
  );
}

function importsSupabaseClient(text) {
  return (
    /from\s+['"]@supabase\//.test(text) ||
    /from\s+['"]@neptlium\/lib\/supabase\/(?:server|client)['"]/.test(text) ||
    /createSupabase(?:Server|Browser)Client/.test(text)
  );
}

test('customer app has no direct Supabase data access outside auth/session exceptions', () => {
  const violations = [];
  for (const file of sourceFiles) {
    const path = normalize(file);
    const text = source(file).replaceAll('Array.from', 'Array_from');
    const usesDataAccess = /\.from\s*\(|\.rpc\s*\(|supabase\.storage\b/.test(text);
    if (usesDataAccess && !isAuthSessionException(path)) violations.push(path);
  }
  assert.deepEqual(violations, [], `Direct Supabase data access found: ${violations.join(', ')}`);
});

test('Supabase client imports exist only in the current auth/session exception set', () => {
  const violations = [];
  for (const file of sourceFiles) {
    const path = normalize(file);
    if (importsSupabaseClient(source(file)) && !isAuthSessionException(path)) violations.push(path);
  }
  assert.deepEqual(violations, [], `Supabase client outside auth/session boundary: ${violations.join(', ')}`);
});

test('financial and product pages do not import Supabase clients', () => {
  const productRoots = [
    'app/dashboard/page.tsx',
    'app/dashboard/portfolio/page.tsx',
    'app/dashboard/transactions/page.tsx',
    'app/dashboard/wallet/page.tsx',
    'app/dashboard/treasury/page.tsx',
    'app/dashboard/allocations/page.tsx',
    'app/dashboard/notifications/page.tsx',
    'app/dashboard/documents/page.tsx',
    'app/dashboard/settings/page.tsx',
  ];
  for (const path of productRoots) {
    const text = readFileSync(join(appRoot, path), 'utf8');
    assert.equal(importsSupabaseClient(text), false, `${path} must consume apps/api, not Supabase`);
  }
});

test('canonical API client owns customer endpoints and auth forwarding', () => {
  const text = readFileSync(join(appRoot, 'lib/api/client.ts'), 'utf8');
  for (const endpoint of [
    '/v1/customer/overview',
    '/v1/customer/portfolio',
    '/v1/customer/treasury',
    '/v1/customer/allocation',
    '/v1/capital-account/state',
    '/v1/capital-activity',
    '/v1/notifications',
    '/v1/documents',
  ]) {
    assert.equal(text.includes(endpoint), true, `Missing API client endpoint ${endpoint}`);
  }
  assert.equal(text.includes('authorization: `Bearer ${token}`'), true);
  assert.equal(text.includes("const attempts = method === 'GET' ? 2 : 1"), true);
  assert.equal(text.includes("'x-request-id': requestId"), true);
});

test('authenticated product contains no fabricated missing-value money placeholders', () => {
  const violations = [];
  const patterns = [/\$\s*[—-]/, /—\s*USD\b/, /\b0\.00\s+USD\b/, /\$\s*0\.00\b/];
  for (const file of sourceFiles) {
    const text = source(file);
    if (patterns.some((pattern) => pattern.test(text))) violations.push(normalize(file));
  }
  assert.deepEqual(violations, [], `Fabricated financial placeholder found: ${violations.join(', ')}`);
});

test('no privileged server secrets are referenced by the customer app', () => {
  const forbidden = ['SUPABASE_SERVICE_ROLE_KEY', 'CIRCLE_ENTITY_SECRET', 'CIRCLE_API_KEY', 'STRIPE_SECRET_KEY'];
  for (const file of sourceFiles) {
    const text = source(file);
    for (const name of forbidden) assert.equal(text.includes(name), false, `${normalize(file)} references ${name}`);
  }
});
