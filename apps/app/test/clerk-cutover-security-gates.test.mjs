import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('production Clerk cutover requires independently certified identity security', () => {
  const source = read('lib/clerk-cutover.ts');
  for (const required of [
    'NEPTLIUM_CLERK_CUTOVER_APPROVED',
    'NEPTLIUM_IDENTITY_MAPPING_VERIFIED',
    'NEPTLIUM_AUTH_ROLLBACK_VERIFIED',
    'NEPTLIUM_CLERK_JWT_VERIFIER_VERIFIED',
    'NEPTLIUM_CLERK_TENANT_ISOLATION_VERIFIED',
    'NEPTLIUM_CLERK_ACCOUNT_BOOTSTRAP_VERIFIED',
    'clerk-identity-security-not-certified',
  ]) assert.ok(source.includes(required), `missing cutover prerequisite: ${required}`);
  assert.match(source, /NEXT_PUBLIC_SITE_URL !== 'https:\/\/app\.neptlium\.com'/);
});

test('Clerk Preview API continues to require signed identity and active membership', () => {
  const api = read('../api/src/clerk-preview-identity.ts');
  const middleware = read('../api/src/clerk-preview-middleware.ts');
  assert.match(api, /verifyClerkJwtRs256/);
  assert.match(api, /resolveActiveClerkPrincipal/);
  assert.match(api, /isActiveOrganizationMember/);
  assert.match(api, /environment !== 'preview'/);
  assert.match(middleware, /environment !== 'preview'/);
  assert.match(middleware, /authenticateClerkPreviewTenant/);
});
