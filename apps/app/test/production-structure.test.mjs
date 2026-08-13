import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

test('authenticated application consumes canonical shared brand identity', () => {
  const global = read('app/global.css');
  const icon = read('public/icon.svg');
  const mark = read('../../packages/ui/src/shell/NeptliumMark.tsx');
  const uiPackage = read('../../packages/ui/package.json');
  assert.equal(global.includes("@import '@neptlium/ui/styles/brand.css'"), true);
  assert.equal(global.includes('--color-accent-primary: var(--n-brand-blue)'), true);
  assert.equal(global.includes('--color-text-primary: var(--n-brand-ink)'), true);
  assert.equal(global.includes('--color-sidebar: var(--n-brand-canvas)'), true);
  assert.equal(global.includes('--color-topnav: var(--n-brand-canvas)'), true);
  assert.equal(uiPackage.includes('"./styles/brand.css": "./src/styles/brand.css"'), true);
  assert.equal(mark.includes('blue: "#0141F3"'), true);
  assert.equal(mark.includes('ink: "#08111F"'), true);
  assert.equal(icon.includes('#0141F3'), true);
  assert.equal(icon.includes('#2764FF'), false);
  assert.equal(/gradient|radial|crystalline/i.test(global), false);
});

test('primary authenticated navigation stays intentionally constrained', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  for (const label of ['Overview', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation']) {
    assert.equal(nav.includes(`label: '${label}'`), true, `missing ${label}`);
  }
  for (const mobile of ['Home', 'Portfolio', 'Capital', 'Allocation']) {
    assert.equal(nav.includes(`label: '${mobile}'`), true, `missing mobile ${mobile}`);
  }
});

test('mobile shell preserves safe areas, drawer focus governance, and four primary destinations', () => {
  const mobile = read('../../packages/ui/src/shell/MobileNavigation.tsx');
  const shell = read('../../packages/ui/src/shell/AppShell.tsx');
  assert.equal(mobile.includes('grid-cols-4'), true);
  assert.equal(mobile.includes('env(safe-area-inset-bottom)'), true);
  assert.equal(mobile.includes('100dvh'), true);
  assert.equal(mobile.includes('document.body.style.overflow = "hidden"'), true);
  assert.equal(mobile.includes('event.key === "Escape"'), true);
  assert.equal(mobile.includes('triggerRef.current?.focus()'), true);
  assert.equal(shell.includes('xl:w-[248px]'), true);
  assert.equal(shell.includes('h-16'), true);
  assert.equal(shell.includes('overflow-x-hidden'), true);
});

test('product-wide state vocabulary is governed and non-color-only', () => {
  const productState = read('components/product/ProductState.tsx');
  for (const state of [
    'LOADING',
    'AVAILABLE',
    'READY',
    'PENDING',
    'AWAITING_PROVISIONING',
    'CAPABILITY_DISABLED',
    'RESERVED',
    'RESTRICTED',
    'REQUIRES_APPROVAL',
    'NOT_CONFIGURED',
    'INELIGIBLE',
    'UNAVAILABLE',
    'NO_ACTIVITY',
    'NO_POSITION',
    'ERROR',
  ]) {
    assert.equal(productState.includes(`'${state}'`), true, `missing state ${state}`);
  }
  assert.equal(productState.includes("role={state === 'ERROR' ? 'alert'"), true);
  assert.equal(productState.includes("state === 'LOADING' ? 'status'"), true);
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
  assert.equal(actions.includes('/v1/capital-account/provider-wallet'), false);
  assert.equal(actions.includes('/v1/wallet/withdrawals'), false);
  assert.equal(/bc1[a-z0-9]{10,}/i.test(view), false);
  assert.equal(/0x[a-f0-9]{20,}/i.test(view), false);
  assert.equal(/['"`]r[A-HJ-NP-Za-km-z1-9]{24,34}['"`]/.test(view), false);
});

test('legacy deposit, withdrawal, and transfer routes converge on governed workspaces', () => {
  assert.equal(read('app/dashboard/deposit/page.tsx').includes("redirect('/dashboard/wallet')"), true);
  assert.equal(read('app/dashboard/withdrawals/page.tsx').includes("redirect('/dashboard/wallet')"), true);
  assert.equal(read('app/dashboard/transfer/page.tsx').includes("redirect('/dashboard/treasury')"), true);
});

test('Portfolio uses governed capabilities and canonical balances rather than trading UI', () => {
  const portfolio = read('app/dashboard/portfolio/page.tsx');
  assert.equal(portfolio.includes('getFundingCapabilities'), true);
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
  assert.equal(portfolio.includes('No cross-asset total or performance value is fabricated'), true);
  for (const forbidden of ['Buy', 'Sell', 'Trade', 'Swap', 'candlestick', 'market ticker']) {
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

test('dashboard loading state does not impersonate financial cards or values', () => {
  const loading = read('app/dashboard/loading.tsx');
  assert.equal(loading.includes('Loading capital state'), true);
  assert.equal(loading.includes('Retrieving governed account'), true);
  assert.equal(/\$[0-9]|[0-9]+(?:\.[0-9]+)?%/.test(loading), false);
  assert.equal(loading.includes('grid-cols-4'), false);
});

test('auth styling has no Blue atmospheric grid or glow', () => {
  const background = read('app/(auth)/components/AuthBackground.tsx');
  const runtimeMarkup = background.replace(/never Blue atmosphere, glow, or decorative grid effects\./i, '');
  assert.equal(/radial|gradient|glow|grid/i.test(runtimeMarkup), false);
});
