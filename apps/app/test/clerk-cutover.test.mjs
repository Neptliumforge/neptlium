import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const repoRoot = resolve(root, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const readRepo = (path) => readFileSync(resolve(repoRoot, path), 'utf8');

test('customer application sessions and API bearer tokens are Clerk-only', () => {
  assert.match(read('proxy.ts'), /clerkMiddleware/);
  assert.match(read('app/layout.tsx'), /ClerkProvider/);
  assert.match(read('lib/api/client.ts'), /getToken\(\)/);
  assert.match(read('.env.example'), /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  assert.doesNotMatch(read('.env.example'), /SUPABASE/);
  assert.equal(existsSync(resolve(root, 'app/api/auth/link-existing/route.ts')), false);
});

test('authenticated completion preserves principals without a second authentication provider', () => {
  const complete = read('app/auth/complete/page.tsx');
  const bootstrap = read('lib/api/bootstrap.ts');
  assert.match(complete, /bootstrapClerkIdentity/);
  assert.match(bootstrap, /\/v1\/auth\/bootstrap/);
  assert.doesNotMatch(complete, /\/auth\/link-existing/);
  assert.match(complete, /No legacy password is required/);
});

test('architecture documentation names Clerk as the only authentication provider', () => {
  const appReadme = read('README.md');
  const appArchitecture = readRepo('docs/02_AUTHENTICATED_APPLICATION.md');
  const identityArchitecture = readRepo('docs/04_IDENTITY_AND_ACCESS.md');
  assert.match(appReadme, /Clerk is the sole browser authentication/);
  assert.match(identityArchitecture, /sole authentication/);
  assert.match(identityArchitecture, /Runtime authentication is Clerk-only/);
  assert.doesNotMatch(identityArchitecture, /API_AUTH_MODE=DUAL/);
  assert.doesNotMatch(appArchitecture, /dual-session linking flow/);
});
