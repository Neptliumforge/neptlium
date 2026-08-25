import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const repoRoot = resolve(root, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const readRepo = (path) => readFileSync(resolve(repoRoot, path), 'utf8');

test('customer application sessions and API bearer tokens are Clerk-only in source', () => {
  assert.match(read('proxy.ts'), /clerkMiddleware/);
  assert.match(read('app/layout.tsx'), /ClerkProvider/);
  assert.match(read('lib/api/client.ts'), /getToken\(\)/);
  assert.doesNotMatch(read('package.json'), /@supabase\/supabase-js/);
  assert.match(read('.env.example'), /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
});

test('first authenticated app entry bootstraps through the API and preserves existing-account continuity', () => {
  const complete = read('app/auth/complete/page.tsx');
  const bootstrap = read('lib/api/bootstrap.ts');
  assert.match(complete, /bootstrapClerkIdentity/);
  assert.match(bootstrap, /\/v1\/auth\/bootstrap/);
  assert.match(bootstrap, /link_required/);
  assert.match(complete, /redirect\('\/auth\/link-existing'\)/);
  assert.doesNotMatch(complete, /owner_id|supabase/i);
});

test('application documentation records schema cutover separately from runtime certification', () => {
  const appReadme = read('README.md');
  const appArchitecture = readRepo('docs/02_AUTHENTICATED_APPLICATION.md');
  const identityArchitecture = readRepo('docs/04_IDENTITY_AND_ACCESS.md');

  assert.match(appReadme, /Clerk is the browser authentication\/session authority in `apps\/app` source/);
  assert.match(appReadme, /provider-independent identity foundation and Clerk application identity cutover have been applied/);
  assert.match(appReadme, /Production runtime activation remains separate from schema readiness/);
  assert.doesNotMatch(appReadme, /Supabase Auth remains the current session\/identity mechanism/);
  assert.match(appArchitecture, /CURRENT PRODUCTION SCHEMA/);
  assert.match(appArchitecture, /CURRENT PRODUCTION RUNTIME/);
  assert.match(appArchitecture, /16 existing profiles and 16 active Neptlium principals/);
  assert.match(identityArchitecture, /CURRENT PRODUCTION SCHEMA/);
  assert.match(identityArchitecture, /CURRENT PRODUCTION RUNTIME/);
  assert.match(identityArchitecture, /API_AUTH_MODE=DUAL/);
});
