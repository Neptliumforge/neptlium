import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('sign up is personal-first and carries the canonical Neptlium identity', () => {
  const signUp = read('app/auth/sign-up/page.tsx');
  const authShell = read('app/(auth)/components/AuthShell.tsx');

  assert.match(signUp, /Create your Neptlium account/);
  assert.match(signUp, /Organization details are not required to get started/);
  assert.doesNotMatch(signUp, /capital operating environment|Create access/);
  assert.match(authShell, /tone="teal"/);
  assert.doesNotMatch(authShell, /Operating environment|Secure operating access|governed environment/);
});

test('onboarding provisions a personal account without organization classification', () => {
  const wizard = read('app/onboarding/OnboardingWizard.tsx');
  const steps = read('app/onboarding/wizard-steps.ts');

  assert.match(wizard, /investorType: 'individual'/);
  assert.match(wizard, /Organization details are not required for your personal account/);
  assert.doesNotMatch(wizard, /Account type|Organization name|Family office|Investment firm|Treasury team/);
  assert.match(steps, /details/);
  assert.match(steps, /review/);
  assert.doesNotMatch(steps, /account-type|organization/);
});

test('authenticated shell is quiet and brand-linked rather than tenant-console styled', () => {
  const layout = read('app/dashboard/layout.tsx');
  const styles = read('app/global.css');

  assert.match(layout, /brandTone="teal"/);
  assert.doesNotMatch(layout, /Current operating context|Canonical and governed where available|Capital state/);
  assert.match(styles, /--color-sidebar: #f5f3ee/);
  assert.match(styles, /--n-mineral-teal: #0f8f86/);
});

test('ordinary product states suppress implementation and build-stage vocabulary', () => {
  const states = read('components/product/ProductState.tsx');
  const overview = read('app/dashboard/page.tsx');
  const transactions = read('app/dashboard/transactions/page.tsx');

  assert.match(states, /implementationLanguage/);
  for (const token of ['api', 'backend', 'canonical', 'governed', 'provider', 'provisioning']) {
    assert.ok(states.includes(token), `expected implementation-language guard for ${token}`);
  }
  assert.match(states, /will appear here/);
  assert.doesNotMatch(overview, /The Neptlium API|canonical intents|governed product state|Canonical state/);
  assert.doesNotMatch(transactions, /governed activity APIs|canonical intents|supplied by api\.neptlium\.com/);
});
