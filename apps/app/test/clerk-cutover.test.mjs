import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('customer application sessions and API bearer tokens are Clerk-only', () => {
  assert.match(read('proxy.ts'), /clerkMiddleware/);
  assert.match(read('app/layout.tsx'), /ClerkProvider/);
  assert.match(read('lib/api/client.ts'), /getToken\(\)/);
  assert.doesNotMatch(read('package.json'), /@supabase\/supabase-js/);
});

test('first authenticated app entry bootstraps only through the API', () => {
  const complete = read('app/auth/complete/page.tsx');
  assert.match(complete, /bootstrapClerkAccount/);
  assert.match(read('lib/api/client.ts'), /\/v1\/auth\/bootstrap/);
  assert.doesNotMatch(complete, /email|owner_id|supabase/i);
});
