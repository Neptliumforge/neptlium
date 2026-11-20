import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../lib/auth/clerk-principal-gate.ts'), 'utf8');

test('Clerk principal gate is an inactive, fail-closed API-owned identity contract', () => {
  for (const required of [
    'verifiedProvider',
    'providerSubject',
    'principalId',
    'activePrincipal',
    'activeProviderLink',
    'activeMembership',
    'requestedTenantId',
    'resolution.tenantId.toLowerCase() !== resolution.requestedTenantId.toLowerCase()',
    "throw new Error('clerk_principal_unavailable')",
  ]) assert.ok(source.includes(required), `missing fail-closed contract: ${required}`);
  assert.doesNotMatch(source, /process\.env|service_role|createSupabaseBrowserClient/);
  assert.doesNotMatch(source, /email\s*===|email\s*==/);
});
