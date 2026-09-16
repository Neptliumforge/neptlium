import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const page = read('app/dashboard/capital-account/page.tsx');
const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
const actions = read('app/dashboard/capital-account/actions.ts');
const surface = `${page}\n${view}`;

test('legacy Capital Account workspace remains protected and authoritative', () => {
  assert.match(page, /requireProvisionedUser/);
  for (const contract of [
    'getCanonicalBalances',
    'getFundingCapabilities',
    'getFundingActivity',
    'getTransferCapabilities',
    'getTransferActivity',
    'getTransferAliases',
  ]) {
    assert.match(page, new RegExp(contract), `missing ${contract}`);
  }
  assert.doesNotMatch(surface, /apiRequest|\/v1\/|supabase|createClient|\.from\(/i);
});

test('legacy Capital Account preserves explicit financial states without fabricated values', () => {
  for (const state of ['Available', 'Pending', 'Reserved', 'Restricted', 'Unavailable'])
    assert.match(view, new RegExp(state, 'i'), `missing ${state}`);
  for (const forbidden of [
    /portfolio performance/i,
    /returns/i,
    /net worth/i,
    /fake balance/i,
    /\$250,000/,
  ])
    assert.doesNotMatch(surface, forbidden);
  assert.doesNotMatch(page, /\?\? ['"]0['"]/);
});

test('financial mutations remain server-owned and lifecycle-gated', () => {
  assert.match(actions, /createFundingIntent/);
  assert.match(actions, /getDepositInstructionsForIntent/);
  assert.match(actions, /createTransferAlias/);
  assert.doesNotMatch(actions, /apiRequest|\/v1\/|circle|alchemy|stripe|supabase/i);
  assert.match(view, /productStateFromCapability/);
  assert.doesNotMatch(view, /<Button[^>]*>\s*Request movement/);
});

test('legacy Capital Account exposes governed funding and movement lifecycles', () => {
  for (const stage of [
    'Funding intent',
    'Deposit route',
    'Provider observation',
    'Reconciliation',
    'Capital state update',
    'Destination verification',
    'Reservation',
    'Provider submission',
    'Settlement',
  ])
    assert.match(view, new RegExp(stage), `missing lifecycle stage ${stage}`);
  assert.match(view, /Authority boundary/);
  assert.match(view, /Approval does not submit or settle a movement/);
  assert.match(
    view,
    /Capital becomes available only after provider evidence, ledger posting, and\s+reconciliation/,
  );
});

test('admin operations do not overstate completion authority', () => {
  const deposits = read('../admin/app/(admin)/dashboard/deposits/page.tsx');
  const withdrawals = read('../admin/app/(admin)/dashboard/withdrawals/page.tsx');
  assert.match(deposits, /Awaiting governed reconciliation/);
  assert.doesNotMatch(deposits, /Mark Completed/);
  assert.match(withdrawals, /Approval does not submit to a provider or confirm settlement/);
  assert.match(withdrawals, /Rejection unavailable/);
});

test('personal Capital actions remain reachable without entering primary navigation', () => {
  const navigation = read('components/navigation/dashboardNav.tsx');
  const canonical = read('app/dashboard/capital/page.tsx');
  const legacyWallet = read('app/dashboard/wallet/page.tsx');
  assert.match(navigation, /label: 'Capital actions',[\s\S]*?href: '\/dashboard\/capital'/);
  assert.match(canonical, /CapitalExperience/);
  assert.match(legacyWallet, /redirect\('\/dashboard\/capital-account'\)/);
});

test('Overview links to canonical Capital while shared bootstrap retains authoritative contracts', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  const bootstrap = read('lib/product/bootstrap.ts');
  assert.match(experience, /Your capital/);
  assert.match(experience, /\/dashboard\/capital/);
  assert.doesNotMatch(experience, /href="\/dashboard\/wallet"/);
  assert.match(bootstrap, /getCanonicalBalances/);
  assert.match(bootstrap, /getFundingCapabilities/);
  assert.match(bootstrap, /getTransferCapabilities/);
});
