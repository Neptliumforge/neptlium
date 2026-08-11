import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

test('primary authenticated navigation stays intentionally constrained', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  for (const label of ['Overview', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation']) {
    assert.equal(nav.includes(`label: '${label}'`), true, `missing ${label}`);
  }
  for (const mobile of ['Home', 'Portfolio', 'Capital', 'Allocation']) {
    assert.equal(nav.includes(`label: '${mobile}'`), true, `missing mobile ${mobile}`);
  }
});

test('Capital Account exposes canonical ledger source and governed production states', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  assert.equal(view.includes('Source: Neptlium canonical ledger'), true);
  assert.equal(view.includes('Provider aggregate balances are not shown as customer capital'), true);
  assert.equal(view.includes("['Balances', 'Deposit', 'Withdraw', 'Activity']"), true);
  assert.equal(view.includes('Manual approval governs outbound movement'), true);
  assert.equal(view.includes('Pending approval'), true);
  assert.equal(view.includes('Approved'), true);
  assert.equal(view.includes('Settled'), true);
  assert.equal(view.includes('Reconciled'), true);
});

test('Deposit UX is capability-driven and never hardcodes a treasury destination', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  const actions = read('app/dashboard/wallet/actions.ts');
  assert.equal(view.includes('capabilities.map'), true);
  assert.equal(view.includes('deposit_address'), true);
  assert.equal(view.includes('memo_or_tag'), true);
  assert.equal(view.includes('createFundingIntentAction'), true);
  assert.equal(actions.includes('/v1/funding/intents'), true);
  assert.equal(actions.includes('/v1/capital-account/deposit-instructions'), true);
  assert.equal(/bc1[a-z0-9]{10,}/i.test(view), false);
  assert.equal(/0x[a-f0-9]{20,}/i.test(view), false);
  assert.equal(/['"`]r[A-HJ-NP-Za-km-z1-9]{24,34}['"`]/.test(view), false);
});

test('Portfolio uses governed capabilities and canonical balances rather than trading UI', () => {
  const portfolio = read('app/dashboard/portfolio/page.tsx');
  assert.equal(portfolio.includes('getFundingCapabilities'), true);
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
  for (const forbidden of ['Buy', 'Sell', 'candlestick', 'market ticker']) {
    assert.equal(portfolio.includes(forbidden), false, `portfolio contains ${forbidden}`);
  }
});

test('Treasury is operational and transfer lifecycle remains governed', () => {
  const treasury = read('app/dashboard/treasury/TreasuryView.tsx');
  assert.equal(treasury.includes('Canonical liquidity'), true);
  assert.equal(treasury.includes('Outbound execution remains closed.'), true);
  assert.equal(treasury.includes('Verified destination references'), true);
  assert.equal(treasury.includes('Provider aggregate balances are not substituted'), true);
});

test('Activity is sourced from governed funding and transfer APIs', () => {
  const page = read('app/dashboard/transactions/page.tsx');
  assert.equal(page.includes('getFundingActivity'), true);
  assert.equal(page.includes('getTransferActivity'), true);
  assert.equal(page.includes('getCapitalActivity'), false);
  assert.equal(page.includes('No capital activity yet'), true);
});

test('Allocation remains visible while execution stays unavailable', () => {
  const allocation = read('app/dashboard/allocations/AllocationModes.tsx');
  assert.equal(allocation.includes('Observed'), true);
  assert.equal(allocation.includes('Modeled'), true);
  assert.equal(allocation.includes('Authorized'), true);
  assert.equal(allocation.includes('Executed'), true);
  assert.equal(allocation.includes('Reconciled'), true);
  assert.equal(allocation.includes('Execution unavailable'), true);
  assert.equal(allocation.includes('Nothing entered here is canonical, authorized, or executable.'), true);
});

test('auth styling has no Blue atmospheric grid or glow', () => {
  const background = read('app/(auth)/components/AuthBackground.tsx');
  const runtimeMarkup = background.replace(/never Blue atmosphere, glow, or decorative grid effects\./i, '');
  assert.equal(/radial|gradient|glow|grid/i.test(runtimeMarkup), false);
});
