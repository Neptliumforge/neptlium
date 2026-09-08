import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const page = read('app/dashboard/capital-account/page.tsx');
const components = read('components/product/CapitalAccountExperience.tsx');
const surface = `${page}\n${components}`;

test('Capital Account is a protected production UI shell without financial backend dependency', () => {
  assert.match(page, /requireProvisionedUser/);
  assert.doesNotMatch(
    page,
    /getCanonicalBalances|getFundingCapabilities|getTransferCapabilities|getFundingActivity|getTransferActivity|getTransferAliases/,
  );
  assert.doesNotMatch(page, /apiRequest|\/v1\//);
  assert.doesNotMatch(page, /supabase|createClient|\.from\(/i);
});

test('Capital Account presents the required institutional architecture', () => {
  for (const component of [
    'CapitalAccountHeader',
    'CapitalPositionCard',
    'AccountStateGrid',
    'CapitalActionState',
    'BalancePanel',
    'MovementPanel',
    'DestinationPanel',
    'ActivityPanel',
    'CapitalContextPanel',
  ]) {
    assert.match(surface, new RegExp(component), `missing ${component}`);
  }
  assert.match(
    components,
    /Understand capital availability, account state, and movement readiness\./,
  );
  assert.match(components, /Private environment/);
  assert.match(components, /Account overview/);
});

test('Capital Account placeholder states are intentional and explicit', () => {
  for (const state of [
    'No capital positions yet.',
    'Awaiting account data',
    'Balances unavailable',
    'Movement capability unavailable',
    'Account configuration incomplete',
    'No balances available.',
    'No destinations configured.',
    'No activity recorded.',
    'Awaiting connection',
  ]) {
    assert.match(surface, new RegExp(state.replaceAll('.', '\\.')), `missing ${state}`);
  }
});

test('Capital Account contains no fabricated financial data or activity', () => {
  for (const forbidden of [
    /\$\s?0(?:\.00)?/,
    /\$\s?[1-9][\d,]*(?:\.\d+)?/,
    /\b\d+ transactions?\b/i,
    /portfolio value/i,
    /fake balance/i,
  ]) {
    assert.doesNotMatch(surface, forbidden);
  }
});

test('Capital Account exposes capability locations without execution controls or provider claims', () => {
  for (const label of ['Deposit', 'Withdraw', 'Transfer'])
    assert.match(page, new RegExp(`label: '${label}'`));
  assert.doesNotMatch(surface, /<button|<Button|<form|onClick=|type="submit"/);
  assert.doesNotMatch(
    surface,
    /deposit_address|memo_or_tag|Submit withdrawal|Continue to instructions/,
  );
  assert.doesNotMatch(surface, /Coinbase|Circle|Stripe|Alchemy|provider/i);
  assert.match(components, /No capital action can be initiated from this workspace\./);
});

test('canonical Capital Account route replaces the legacy wallet entry safely', () => {
  const navigation = read('components/navigation/dashboardNav.tsx');
  const legacy = read('app/dashboard/wallet/page.tsx');
  assert.match(navigation, /label: 'Capital Account',[\s\S]*?href: '\/dashboard\/capital-account'/);
  assert.match(legacy, /redirect\('\/dashboard\/capital-account'\)/);
});
