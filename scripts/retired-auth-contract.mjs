import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// The previous audit incorrectly classified Clerk as retired, although the
// repository contains a guarded Clerk Preview migration. Preserve a fail-closed
// security contract instead of deleting active identity implementation.
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const checks = [
  ['API Preview-only gate', 'apps/api/src/clerk-token-boundary.ts', [
    /NEPTLIUM_API_AUTH_PROVIDER !== 'clerk-preview'/,
    /VERCEL_ENV !== 'preview'/,
    /NEPTLIUM_CLERK_API_VERIFIER_TESTED/,
    /NEPTLIUM_CLERK_IDENTITY_RESOLVER_TESTED/,
    /NEPTLIUM_CLERK_TENANT_ISOLATION_TESTED/,
  ]],
  ['Preview middleware environment guard', 'apps/api/src/clerk-preview-middleware.ts', [
    /environment !== 'preview'/,
    /authenticateClerkPreviewTenant/,
  ]],
  ['Customer cutover approval and rollback guard', 'apps/app/lib/clerk-cutover.ts', [
    /NEPTLIUM_CLERK_CUTOVER_APPROVED/,
    /NEPTLIUM_IDENTITY_MAPPING_VERIFIED/,
    /NEPTLIUM_AUTH_ROLLBACK_VERIFIED/,
    /NEXT_PUBLIC_SITE_URL !== 'https:\/\/app\.neptlium\.com'/,
  ]],
];
let failed = false;
for (const [name, path, patterns] of checks) {
  let content;
  try { content = read(path); } catch (error) {
    console.error(`FAIL ${name}: missing ${path}: ${error.message}`);
    failed = true;
    continue;
  }
  for (const pattern of patterns) {
    try { assert.match(content, pattern); }
    catch { console.error(`FAIL ${name}: missing required guard ${pattern}`); failed = true; }
  }
}
if (failed) process.exitCode = 1;
else console.log('Authentication cutover guard source contract: PASS (static checks only)');
