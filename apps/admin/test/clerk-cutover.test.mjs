import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('admin uses Clerk sessions but retains server-side API authorization', () => {
  assert.match(read('proxy.ts'), /clerkMiddleware/);
  assert.match(read('app/layout.tsx'), /ClerkProvider/);
  assert.match(read('lib/api/client.ts'), /getToken\(\)/);
  assert.match(read('lib/auth/session.ts'), /\/v1\/admin\/session/);
  assert.doesNotMatch(read('package.json'), /@supabase\/supabase-js/);
});

test('admin login does not expose an application sign-up route', () => {
  assert.doesNotMatch(read('app/(auth)/login/page.tsx'), /SignUp|signUpUrl/);
});
