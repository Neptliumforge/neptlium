import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const ordinaryCustomerSurfaces = [
  'app/(auth)/components/AuthShell.tsx',
  'app/auth/sign-in/page.tsx',
  'app/auth/sign-up/page.tsx',
  'app/onboarding/OnboardingWizard.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/documents/page.tsx',
  'app/dashboard/transactions/page.tsx',
  'app/dashboard/administration/page.tsx',
  'app/dashboard/capital-account/page.tsx',
  'components/product/CapitalAccountExperience.tsx',
  'app/dashboard/treasury/TreasuryView.tsx',
  'components/product/ProductState.tsx',
];

const forbiddenOrdinaryCopy = [
  /will appear here/i,
  /tools will appear here/i,
  /the backend/i,
  /api\.neptlium\.com/i,
  /governed activity APIs/i,
  /canonical and governed where available/i,
  /current operating context/i,
  /operating environment/i,
  /capability exposed/i,
  /canonical capital state/i,
  /source of truth · neptlium canonical ledger/i,
];

test('sign up is personal-first and carries the canonical Neptlium identity', () => {
  const signUp = read('app/auth/sign-up/page.tsx');
  const authShell = read('app/(auth)/components/AuthShell.tsx');

  assert.match(signUp, /Create your Neptlium account/);
  assert.match(signUp, /Organization details are not required to get started/);
  assert.match(signUp, /fallbackRedirectUrl="\/auth\/complete"/);
  assert.doesNotMatch(signUp, /organization name|company website|company role|upload.*logo/i);
  assert.doesNotMatch(signUp, /capital operating environment|Create access/);
  assert.match(authShell, /tone="teal"/);
  assert.doesNotMatch(
    authShell,
    /Operating environment|Secure operating access|governed environment/,
  );
});

test('onboarding is a two-step personal account flow without organization-first fields', () => {
  const wizard = read('app/onboarding/OnboardingWizard.tsx');
  const steps = read('app/onboarding/wizard-steps.ts');

  assert.match(wizard, /investorType: 'individual'/);
  assert.match(wizard, /totalSteps=\{2\}/);
  assert.match(wizard, /Organization details are not required for your personal account/);
  assert.match(wizard, /organizationName: ''/);
  assert.match(wizard, /companyRole: ''/);
  assert.match(wizard, /website: ''/);
  assert.doesNotMatch(
    wizard,
    /label="Organization name"|label="Company website"|label="Company role"|upload.*logo/i,
  );
  assert.doesNotMatch(wizard, /Account type|Family office|Investment firm|Treasury team/);
  assert.match(steps, /details/);
  assert.match(steps, /review/);
  assert.doesNotMatch(steps, /account-type|organization/);
});

test('authenticated shell is quiet and brand-linked rather than tenant-console styled', () => {
  const layout = read('app/dashboard/layout.tsx');
  const styles = read('app/global.css');

  assert.match(layout, /brandTone="teal"/);
  assert.doesNotMatch(
    layout,
    /Current operating context|Canonical and governed where available|Capital state/,
  );
  assert.match(styles, /--color-sidebar: #f5f3ee/);
  assert.match(styles, /--n-mineral-teal: #0f8f86/);
});

test('product-state messages use explicit source copy rather than regex rewriting', () => {
  const states = read('components/product/ProductState.tsx');
  assert.match(states, /const body = children \?\? descriptions\[state\]/);
  assert.doesNotMatch(states, /implementationLanguage|\.test\(children\)/);
});

test('ordinary customer surfaces reject build-stage and implementation vocabulary', () => {
  for (const path of ordinaryCustomerSurfaces) {
    const source = read(path);
    const customerCopy =
      path === 'app/dashboard/page.tsx'
        ? source.replace('Capital Operating Environment', '')
        : source;
    for (const phrase of forbiddenOrdinaryCopy) {
      if (
        [
          'app/dashboard/capital-account/page.tsx',
          'components/product/CapitalAccountExperience.tsx',
        ].includes(path) &&
        phrase.source === 'will appear here'
      )
        continue;
      assert.doesNotMatch(
        customerCopy,
        phrase,
        `${path} contains prohibited ordinary customer copy: ${phrase}`,
      );
    }
  }
});

test('capital account and treasury zero/error states read as finished product states', () => {
  const capital = read('components/product/CapitalAccountExperience.tsx');
  const treasury = read('app/dashboard/treasury/TreasuryView.tsx');

  assert.match(capital, /No capital positions yet/);
  assert.match(capital, /No balances available/);
  assert.match(capital, /No destinations configured/);
  assert.match(capital, /No activity recorded/);
  assert.doesNotMatch(
    capital,
    /Canonical ledger balances|No customer funding capability|frontend review|apps\/app does not have an API mutation/,
  );

  assert.match(treasury, /No capital positions yet/);
  assert.match(treasury, /No transfers yet/);
  assert.match(treasury, /No destinations saved/);
  assert.doesNotMatch(
    treasury,
    /canonical liquidity|governed funding rail|canonical lifecycle events|provider aggregate/i,
  );
});
