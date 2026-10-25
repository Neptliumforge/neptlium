import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const read = (p) => readFileSync(resolve(import.meta.dirname, '..', p), 'utf8');

test('Clerk fallback never promotes provider subject to internal principal', () => {
  const guards = read('lib/auth/guards.ts');
  const session = read('lib/auth/session.ts');
  assert.match(guards, /function fallbackProfile[\s\S]*id: null/);
  assert.match(session, /interface SessionProfile[\s\S]*id: string \| null/);
  assert.doesNotMatch(guards, /id: user\.id,\s*email: user\.email/);
});

test('Clerk sign-in resolves account provisioning before selecting return destination', () => {
  const action = read('lib/auth/clerk-actions.ts');
  const complete = read('app/auth/complete/Completion.tsx');
  assert.match(action, /await getAccountContext\(\)/);
  assert.match(action, /provisioned: Boolean\(account\.provisionedAt\)/);
  assert.match(complete, /result\.provisioned/);
  assert.match(complete, /safeInternalPath\(returnTo\)/);
});

test('onboarding fails recoverably on unavailable API identity', () => {
  const state = read('lib/auth/account-state.ts');
  const page = read('app/onboarding/page.tsx');
  assert.match(state, /catch \{[\s\S]*state: 'UNVERIFIED'/);
  assert.match(page, /account\.state === 'UNVERIFIED'/);
  assert.match(page, /Account setup temporarily unavailable/);
});
