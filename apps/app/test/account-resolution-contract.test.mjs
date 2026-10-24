import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const read = (path) => readFileSync(resolve(import.meta.dirname, '..', path), 'utf8');

test('account state separates provisioned, incomplete and unverified API outcomes', () => {
  const source = read('lib/auth/account-state.ts');
  for (const state of ['PROVISIONED', 'NOT_PROVISIONED', 'UNVERIFIED']) {
    assert.match(source, new RegExp(`state: '${state}'`));
  }
  assert.match(source, /getCurrentProfile\(user\)/);
  assert.match(source, /if \(!profile\.id\) return \{ state: 'UNVERIFIED'/);
  assert.match(source, /if \(!profile\.provisionedAt\) return \{ state: 'NOT_PROVISIONED'/);
  assert.match(source, /catch \{[\s\S]*state: 'UNVERIFIED'/);
});

test('onboarding only redirects a verified provisioned customer', () => {
  const source = read('app/onboarding/page.tsx');
  assert.match(source, /resolveAccountState\(user\)/);
  assert.match(source, /account\.state === 'PROVISIONED'/);
  assert.match(source, /account\.state === 'UNVERIFIED'/);
  assert.match(source, /<OnboardingWizard/);
  assert.doesNotMatch(source, /getCurrentProfile\(\)/);
});

test('dashboard remains session accessible while account bootstrap stays nullable', () => {
  const guards = read('lib/auth/guards.ts');
  const layout = read('app/dashboard/layout.tsx');
  assert.match(guards, /id: null/);
  assert.match(layout, /id: profile\.id/);
  assert.doesNotMatch(layout, /redirect\(['"]\/onboarding/);
});
