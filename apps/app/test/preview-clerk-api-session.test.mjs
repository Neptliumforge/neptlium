import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (p) => readFileSync(resolve(import.meta.dirname, '..', p), 'utf8');

test('Preview Clerk API adapter requires server-only environment and tenant-scoped resolution', () => {
  const source = read('lib/auth/preview-clerk-api-session.ts');
  for (const required of [
    "import 'server-only'",
    "deps.environment !== 'preview'",
    "deps.apiProvider !== 'clerk-preview'",
    'deps.getSessionToken()',
    'deps.resolveVerifiedPrincipal(token, tenantId)',
    'requireVerifiedClerkPrincipal(resolution)',
    'resolution.requestedTenantId.toLowerCase() !== tenantId.toLowerCase()',
  ]) assert.ok(source.includes(required), `missing preview boundary: ${required}`);
  assert.doesNotMatch(source, /createSupabaseBrowserClient|service_role|localStorage/);
});

test('production API client remains unchanged until verified end-to-end cutover', () => {
  const client = read('lib/api/client.ts');
  assert.match(client, /supabase\.auth\.getUser\(\)/);
  assert.match(client, /supabase\.auth\.getSession\(\)/);
  assert.doesNotMatch(client, /resolvePreviewClerkApiSession/);
});
