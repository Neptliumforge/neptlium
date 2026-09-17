import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('dashboard renders shared API-backed state instead of illustrative financial values', () => {
  const dashboard = read('app/dashboard/page.tsx');
  const experience = read('components/product/OperatingExperience.tsx');
  const bootstrap = read('lib/product/bootstrap.ts');
  assert.match(dashboard, /OverviewExperience/);
  assert.match(bootstrap, /getOverviewState/);
  assert.match(bootstrap, /getCanonicalBalances/);
  assert.match(experience, /Recent activity/);
  assert.match(experience, /Your capital/);
  assert.doesNotMatch(experience, /Public markets|Private companies|Company position updated|36%|28%/);
});

test('deposit route is a dedicated personal funding experience', () => {
  const deposit = read('app/dashboard/deposit/page.tsx');
  assert.match(deposit, /\/dashboard\/deposit\/crypto/);
  assert.match(deposit, /Fund your account/);
  assert.match(deposit, /Bank and card funding are not available/);
  assert.match(deposit, /balance changes only after funds are confirmed/);
  assert.doesNotMatch(deposit, /redirect\('/);
  assert.doesNotMatch(deposit, /Stripe capital funding pending/);
});

test('crypto deposit creates instructions through the governed funding action and links to activity', () => {
  const flow = read('app/dashboard/deposit/crypto/CryptoDepositFlow.tsx');
  assert.match(flow, /createFundingIntentAction/);
  assert.match(flow, /deposit_address/);
  assert.match(flow, /\/dashboard\/activity/);
  assert.match(flow, /Creating instructions records a funding request; it does not mean funds were received/);
  assert.match(flow, /Do not send funds until an address is displayed here/);
  assert.doesNotMatch(flow, /https?:\/\/.*qr/i);
});

test('funding intent invalidates overview, Capital and Activity projections', () => {
  const actions = read('app/dashboard/capital-account/actions.ts');
  assert.match(actions, /revalidatePath\('\/dashboard'\)/);
  assert.match(actions, /revalidatePath\('\/dashboard\/capital'\)/);
  assert.match(actions, /revalidatePath\('\/dashboard\/activity'\)/);
  assert.match(actions, /session_expired/);
});
