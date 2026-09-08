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

test('Capital Account is protected and uses authoritative financial contracts', () => {
  assert.match(page, /requireProvisionedUser/);
  for (const contract of [
    'getCanonicalBalances',
    'getFundingCapabilities',
    'getFundingActivity',
    'getTransferCapabilities',
    'getTransferActivity',
    'getTransferAliases',
  ])
    assert.match(page, new RegExp(contract), `missing ${contract}`);
  assert.doesNotMatch(surface, /apiRequest|\/v1\/|supabase|createClient|\.from\(/i);
});

test('WalletView is elevated and renamed to CapitalAccountView', () => {
  assert.match(view, /export function CapitalAccountView/);
  assert.doesNotMatch(surface, /WalletView|title="Wallet"|>Wallet</);
  assert.match(view, /title="Capital Account"/);
  assert.match(
    view,
    /Understand capital availability, funding routes, movement capability, and account state\./,
  );
});

test('Capital Account uses institutional workspace terminology', () => {
  for (const tab of ['Capital State', 'Funding', 'Movement', 'Destinations', 'Capital Context']) {
    assert.match(view, new RegExp(`'${tab}'`), `missing ${tab}`);
  }
  assert.match(view, /Create funding instruction/);
  assert.match(view, /Request movement/);
  assert.doesNotMatch(view, /Deposit money|Send funds|consumer wallet/i);
});

test('Capital Account preserves explicit financial states without fabricated values', () => {
  for (const state of ['Available', 'Pending', 'Reserved', 'Restricted', 'Unavailable']) {
    assert.match(view, new RegExp(state, 'i'), `missing ${state}`);
  }
  for (const forbidden of [
    /portfolio performance/i,
    /returns/i,
    /net worth/i,
    /fake balance/i,
    /\$250,000/,
  ]) {
    assert.doesNotMatch(surface, forbidden);
  }
  assert.doesNotMatch(page, /\?\? ['"]0['"]/);
});

test('financial mutations remain server-owned and lifecycle-gated', () => {
  assert.match(actions, /createFundingIntent/);
  assert.match(actions, /getDepositInstructionsForIntent/);
  assert.match(actions, /createTransferAlias/);
  assert.doesNotMatch(actions, /apiRequest|\/v1\/|circle|alchemy|stripe|supabase/i);
  assert.match(view, /Movement request unavailable/);
  assert.match(view, /No request has been\s+sent\./);
  assert.match(view, /Reviewing a movement does not reserve or move capital/);
});

test('canonical and compatibility routes converge on Capital Account', () => {
  const navigation = read('components/navigation/dashboardNav.tsx');
  const legacy = read('app/dashboard/wallet/page.tsx');
  const deposit = read('app/dashboard/deposit/page.tsx');
  const withdrawals = read('app/dashboard/withdrawals/page.tsx');
  assert.match(navigation, /label: 'Capital Account',[\s\S]*?href: '\/dashboard\/capital-account'/);
  assert.match(legacy, /redirect\('\/dashboard\/capital-account'\)/);
  assert.match(deposit, /redirect\('\/dashboard\/capital-account#funding'\)/);
  assert.match(withdrawals, /redirect\('\/dashboard\/capital-account#movement'\)/);
});

test('Overview exposes the official Capital Account workspace', () => {
  const overview = read('app/dashboard/page.tsx');
  assert.match(overview, /title: 'Capital Account'/);
  assert.match(overview, /Understand funding, availability, and movement capability\./);
  assert.match(overview, /href: '\/dashboard\/capital-account'/);
  assert.doesNotMatch(overview, /href: '\/dashboard\/wallet'/);
});
