import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('customer presentation state separates empty, unavailable, restricted and failed', () => {
  const state = read('components/product/customer-state.ts');
  for (const name of ['EMPTY', 'AVAILABLE', 'PENDING', 'RESTRICTED', 'UNAVAILABLE', 'FAILED', 'LOADING']) {
    assert.match(state, new RegExp(`'${name}'`));
  }
  assert.match(state, /projection\.state !== 'READY'.*'UNAVAILABLE'/s);
  assert.match(state, /projection\.data\.length === 0 \? 'EMPTY' : 'AVAILABLE'/);
});

test('ordinary Capital UI does not expose provider or infrastructure state names', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  const paymentMethods = read('app/dashboard/settings/payment-methods/page.tsx');
  const fundingActions = read('app/dashboard/capital-account/actions.ts');
  for (const source of [experience, paymentMethods]) {
    assert.doesNotMatch(source, />\s*(?:NOT_CONFIGURED|CAPABILITY_DISABLED|provider_not_configured|Funding intents|Live routes)\s*</);
    assert.doesNotMatch(source, /item\.state\.replaceAll/);
  }
  assert.match(fundingActions, /error\.code === 'provider_not_configured'/);
  assert.doesNotMatch(fundingActions, /Funding infrastructure for this asset is not configured/);
});

test('unknown balances are not rendered as zero and authoritative empty is distinct', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  assert.match(experience, /balanceState === 'UNAVAILABLE'/);
  assert.match(experience, /balanceState === 'EMPTY'/);
  assert.match(experience, /No balance yet/);
  assert.match(experience, /temporarily unavailable/);
  assert.doesNotMatch(experience, /balance.*\?\?\s*['"]0['"]/);
});

test('funding and transfer entry points preserve personal Capital boundaries', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  const transfer = read('app/dashboard/transfer/page.tsx');
  assert.match(experience, />\s*Add funds\s*</);
  assert.doesNotMatch(experience, /Review funding/);
  assert.match(transfer, /redirect\('\/dashboard\/capital'\)/);
  assert.doesNotMatch(transfer, /treasury/i);
});

test('onboarding draft persistence reports save failure to the client', () => {
  const actions = read('app/onboarding/actions.ts');
  const wizard = read('app/onboarding/OnboardingWizard.tsx');
  assert.match(actions, /Promise<ProvisioningResult>/);
  assert.match(actions, /return unavailable\('Your progress could not be saved/);
  assert.match(wizard, /if \(!result\.ok\) throw new Error\(result\.error\)/);
});

test('authentication errors do not expose raw provider messages', () => {
  const authForm = read('app/(auth)/components/SupabaseAuthForm.tsx');
  assert.doesNotMatch(authForm, /setError\(signUpError\.message\)/);
  assert.match(authForm, /We could not create your account\. Review your details and try again\./);
  assert.match(authForm, /console\.error\('Supabase sign-up failed', \{ code: signUpError\.code \}\)/);
});
