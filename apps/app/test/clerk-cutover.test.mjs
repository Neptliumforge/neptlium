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
  assert.doesNotMatch(read('.env.example'), /NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});

test('first authenticated app entry bootstraps only through the API and preserves existing-account continuity', () => {
  const complete = read('app/auth/complete/page.tsx');
  const bootstrap = read('lib/api/bootstrap.ts');
  assert.match(complete, /bootstrapClerkIdentity/);
  assert.match(bootstrap, /\/v1\/auth\/bootstrap/);
  assert.match(bootstrap, /link_required/);
  assert.match(complete, /redirect\('\/auth\/link-existing'\)/);
  assert.doesNotMatch(complete, /owner_id|supabase/i);
});

test('application documentation distinguishes Clerk source authority from production cutover state', () => {
  const appReadme = read('README.md');
  const appArchitecture = readRepo('docs/02_AUTHENTICATED_APPLICATION.md');
  const identityArchitecture = readRepo('docs/04_IDENTITY_AND_ACCESS.md');

  assert.match(appReadme, /Clerk is the browser authentication\/session authority in `apps\/app` source/);
  assert.match(appReadme, /Production remains in a mixed identity state/);
  assert.doesNotMatch(appReadme, /Supabase Auth remains the current session\/identity mechanism/);
  assert.match(appArchitecture, /CURRENT SOURCE identity and API boundary/);
  assert.match(appArchitecture, /CURRENT PRODUCTION identity boundary/);
  assert.match(appArchitecture, /Existing profile UUIDs remain canonical Neptlium principal identifiers/);
  assert.match(identityArchitecture, /apps\/app.*source are implemented around Clerk browser authentication\/session primitives/s);
  assert.match(identityArchitecture, /API_AUTH_MODE=SUPABASE\|DUAL\|CLERK/);
});
