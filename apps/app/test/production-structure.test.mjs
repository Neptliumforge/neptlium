import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

test('authenticated application consumes shared identity with App precision blue', () => {
  const global = read('app/global.css');
  const icon = read('public/icon.svg');
  const mark = read('../../packages/ui/src/shell/NeptliumMark.tsx');
  const uiPackage = read('../../packages/ui/package.json');
  assert.equal(global.includes("@import '@neptlium/ui/styles/brand.css'"), true);
  assert.equal(global.includes('--color-accent-primary: #258BE5'), true);
  assert.equal(global.includes('--color-accent-primary-hover: #319EED'), true);
  assert.equal(global.includes('--color-text-primary: var(--n-brand-ink)'), true);
  assert.equal(global.includes('--color-sidebar: var(--n-brand-canvas)'), true);
  assert.equal(global.includes('--color-topnav: var(--n-brand-canvas)'), true);
  assert.equal(uiPackage.includes('"./styles/brand.css"'), true);
  assert.equal(mark.includes('blue: "#0141F3"'), true);
  assert.equal(mark.includes('ink: "#08111F"'), true);
  assert.equal(icon.includes('#0141F3'), true);
  assert.equal(/gradient|radial|crystalline/i.test(global), false);
});

test('primary authenticated navigation stays intentionally constrained', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  for (const label of ['Overview', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation']) {
    assert.equal(nav.includes(`label: '${label}'`), true, `missing ${label}`);
  }
  const mobilePrimary = nav.slice(
    nav.indexOf('dashboardMobilePrimaryNavItems'),
    nav.indexOf('dashboardMobileSecondaryNavItems'),
  );
  for (const mobile of ['Overview', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation']) {
    assert.equal(mobilePrimary.includes(`label: '${mobile}'`), true, `missing mobile ${mobile}`);
  }
  assert.equal((mobilePrimary.match(/href:/g) ?? []).length, 5);
});

test('authenticated shell preserves institutional desktop and mobile governance', () => {
  const layout = read('app/dashboard/layout.tsx');
  const mobile = read('../../packages/ui/src/shell/MobileNavigation.tsx');
  const shell = read('../../packages/ui/src/shell/AppShell.tsx');
  assert.equal(layout.includes("item.label === 'Settings'"), true);
  assert.equal(layout.includes('sidebarFooter='), true);
  assert.equal(read('app/global.css').includes('grid-template-columns: repeat(5, minmax(0, 1fr))'), true);
  assert.equal(mobile.includes('env(safe-area-inset-bottom)'), true);
  assert.equal(mobile.includes('100dvh'), true);
  assert.equal(mobile.includes('document.body.style.overflow = "hidden"'), true);
  assert.equal(mobile.includes('event.key === "Escape"'), true);
  assert.equal(mobile.includes('triggerRef.current?.focus()'), true);
  assert.equal(shell.includes('xl:w-[248px]'), true);
  assert.equal(shell.includes('h-16'), true);
  assert.equal(shell.includes('overflow-x-hidden'), true);
});

test('application shell exposes a keyboard skip target and institutional workspace width', () => {
  const layout = read('app/dashboard/layout.tsx');
  const global = read('app/global.css');
  assert.equal(layout.includes('Skip to application workspace'), true);
  assert.equal(layout.includes('id="app-workspace"'), true);
  assert.equal(layout.includes('tabIndex={-1}'), true);
  assert.equal(global.includes('main > div { max-width: 100rem; }'), true);
  assert.equal(global.includes('.app-skip-link:focus-visible'), true);
});

test('System theme persists and follows operating-system changes', () => {
  const layout = read('app/layout.tsx');
  const profile = read('components/navigation/ProfileMenu.tsx');
  assert.equal(layout.includes("localStorage.getItem('neptlium-theme')"), true);
  assert.equal(layout.includes("preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'"), true);
  assert.equal(profile.includes("localStorage.setItem('neptlium-theme', next)"), true);
  assert.equal(profile.includes("document.documentElement.dataset.themePreference = theme"), true);
  assert.equal(profile.includes("media.addEventListener('change', synchronize)"), true);
  assert.equal(profile.includes("media.removeEventListener('change', synchronize)"), true);
});

test('product-wide state vocabulary is explicit and non-color-only', () => {
  const productState = read('components/product/ProductState.tsx');
  for (const state of ['LOADING','AVAILABLE','READY','PENDING','AWAITING_PROVISIONING','CAPABILITY_DISABLED','RESERVED','RESTRICTED','REQUIRES_APPROVAL','NOT_CONFIGURED','INELIGIBLE','UNAVAILABLE','NO_ACTIVITY','NO_POSITION','ERROR']) {
    assert.equal(productState.includes(`'${state}'`), true, `missing state ${state}`);
  }
  assert.equal(productState.includes("role={state === 'ERROR' ? 'alert'"), true);
  assert.equal(productState.includes("state === 'LOADING' ? 'status'"), true);
});

test('all five primary workspaces use the shared information-first header', () => {
  const header = read('components/product/WorkspaceHeader.tsx');
  assert.equal(header.includes('border-b border-border-hairline'), true);
  for (const path of ['app/dashboard/page.tsx','app/dashboard/portfolio/page.tsx','app/dashboard/wallet/WalletView.tsx','app/dashboard/treasury/TreasuryView.tsx','app/dashboard/allocations/AllocationWorkspace.tsx']) {
    assert.equal(read(path).includes('WorkspaceHeader'), true, `${path} does not use WorkspaceHeader`);
  }
});

test('Overview is an action-oriented capital operating home without fabricated valuation', () => {
  const overview = read('app/dashboard/page.tsx');
  assert.equal(overview.includes('You&apos;re all caught up.'), true);
  assert.equal(overview.includes('awaiting approval'), true);
  assert.equal(overview.includes('getFundingCapabilities'), true);
  assert.equal(overview.includes("?? '0'"), false);
  assert.equal(overview.includes('0 canonical positions'), true);
  for (const href of ['/dashboard/wallet#deposit','/dashboard/wallet#withdraw','/dashboard/allocations']) assert.equal(overview.includes(href), true);
  assert.equal(overview.includes('Operating readiness'), true);
  assert.equal(overview.includes("enabledFunding.length > 0"), true);
  assert.equal(overview.includes('Review withdrawal'), true);
  assert.equal(overview.includes('Review allocation'), true);
});

test('Capital Account exposes complete governed workflows and canonical balance semantics', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  assert.equal(view.includes('Source of truth · Neptlium canonical ledger'), true);
  for (const tab of ['Balances','Deposit','Withdraw','Destinations','Activity']) assert.equal(view.includes(`'${tab}'`), true, `missing tab ${tab}`);
  assert.equal(view.includes('0 positions'), true);
  assert.equal(view.includes('Canonical available'), true);
  assert.equal(view.includes('Not established'), true);
  for (const state of ['Requested','Reserved','Pending approval','Approved','Submitted','Settled','Reconciled']) assert.equal(view.includes(state), true, `missing withdrawal state ${state}`);
});

test('Deposit UX is capability-driven, copyable, and never hardcodes a treasury destination', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  const actions = read('app/dashboard/wallet/actions.ts');
  assert.equal(view.includes('capabilities.map'), true);
  assert.equal(view.includes('deposit_address'), true);
  assert.equal(view.includes('memo_or_tag'), true);
  assert.equal(view.includes('navigator.clipboard.writeText'), true);
  assert.equal(view.includes('createFundingIntentAction'), true);
  assert.equal(actions.includes('/v1/funding/intents'), true);
  assert.equal(actions.includes('/v1/capital-account/deposit-instructions'), true);
  assert.equal(actions.includes('/v1/capital-account/provider-wallet'), false);
  assert.equal(actions.includes('/v1/wallet/withdrawals'), false);
  assert.equal(/bc1[a-z0-9]{10,}/i.test(view), false);
  assert.equal(/0x[a-f0-9]{20,}/i.test(view), false);
  assert.equal(/['"`]r[A-HJ-NP-Za-km-z1-9]{24,34}['"`]/.test(view), false);
});

test('Withdrawal UX never manufactures canonical availability and remains inert before reservation API support', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  const actions = read('app/dashboard/wallet/actions.ts');
  assert.equal(view.includes("active === 'Withdraw'"), true);
  assert.equal(view.includes('Select verified destination'), true);
  assert.equal(view.includes('Submission capability not exposed'), true);
  assert.equal(view.includes('<Button className="mt-4" disabled>Submit withdrawal</Button>'), true);
  assert.equal(view.includes('valueAtomic={selectedTransferBalance.available_atomic}'), true);
  assert.equal(view.includes("selectedTransferBalance ? '0'"), false);
  assert.equal(view.includes("selectedTransferBalance.available_atomic ?? '0'"), false);
  assert.equal(actions.includes('/v1/treasury/transfers'), false);
  assert.equal(actions.includes('transfer_executions'), false);
});

test('Destination management uses governed alias persistence without pretending verification', () => {
  const view = read('app/dashboard/wallet/WalletView.tsx');
  const actions = read('app/dashboard/wallet/actions.ts');
  assert.equal(view.includes("active === 'Destinations'"), true);
  assert.equal(view.includes('createTransferAliasAction'), true);
  assert.equal(actions.includes('/v1/treasury/aliases'), true);
  assert.equal(view.includes('Saving a destination does not prove ownership'), true);
  assert.equal(view.includes('Destination removal is not exposed by the current API contract'), true);
});

test('legacy capital routes converge on governed workspaces', () => {
  assert.equal(read('app/dashboard/deposit/page.tsx').includes("redirect('/dashboard/wallet')"), true);
  assert.equal(read('app/dashboard/withdrawals/page.tsx').includes("redirect('/dashboard/wallet')"), true);
  assert.equal(read('app/dashboard/transfer/page.tsx').includes("redirect('/dashboard/treasury')"), true);
});

test('Portfolio is canonical-position-first and separates capability coverage', () => {
  const portfolio = read('app/dashboard/portfolio/page.tsx');
  assert.equal(portfolio.includes('getFundingCapabilities'), true);
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
  assert.equal(portfolio.includes('Canonical positions'), true);
  assert.equal(portfolio.includes('Funding coverage'), true);
  assert.equal(portfolio.includes('Funding capability does not create a position'), true);
  assert.equal(portfolio.includes("balances.length === 0 ? '0 positions'"), true);
  assert.equal(portfolio.includes("balance?.available_atomic ?? '0'"), false);
  for (const forbidden of ['Buy', 'Sell', 'Trade', 'Swap', 'candlestick', 'market ticker']) assert.equal(portfolio.includes(forbidden), false, `portfolio contains ${forbidden}`);
});

test('Treasury is a complete liquidity and movement-governance workspace', () => {
  const treasury = read('app/dashboard/treasury/TreasuryView.tsx');
  assert.equal(treasury.includes('Liquidity and movement control'), true);
  assert.equal(treasury.includes('Movement control'), true);
  assert.equal(treasury.includes('Verified destinations'), true);
  assert.equal(treasury.includes('Provider aggregate balances are not substituted'), true);
  assert.equal(treasury.includes('Reservation must precede submission'), true);
  assert.equal(treasury.includes('/dashboard/wallet#withdraw'), true);
  assert.equal(treasury.includes('/dashboard/wallet#destinations'), true);
});

test('Activity is sourced from governed funding and transfer APIs', () => {
  const page = read('app/dashboard/transactions/page.tsx');
  assert.equal(page.includes('getFundingActivity'), true);
  assert.equal(page.includes('getTransferActivity'), true);
  assert.equal(page.includes('getCapitalActivity'), false);
  assert.equal(page.includes('No capital activity yet'), true);
});

test('Allocation exposes policy, drift, authorization, classes, measures, and an execution gate', () => {
  const allocation = read('app/dashboard/allocations/AllocationWorkspace.tsx');
  for (const label of ['Observed','Modeled','Authorized','Executed','Reconciled','Reserve','Core','Growth','Opportunity','Restricted']) assert.equal(allocation.includes(label), true, `Allocation missing ${label}`);
  for (const measure of ['Concentration','Liquidity','Volatility','Reserve coverage','Network','Counterparty','Drift','Utilization']) assert.equal(allocation.includes(measure), true, `Allocation missing measure ${measure}`);
  assert.equal(allocation.includes('Execution unavailable'), true);
  assert.equal(allocation.includes('Authorization can establish a governed decision'), true);
});

test('dashboard loading state does not impersonate financial cards or values', () => {
  const loading = read('app/dashboard/loading.tsx');
  assert.equal(loading.includes('Loading capital state'), true);
  assert.equal(loading.includes('Retrieving governed account'), true);
  assert.equal(/\$[0-9]|[0-9]+(?:\.[0-9]+)?%/.test(loading), false);
  assert.equal(loading.includes('grid-cols-4'), false);
});

test('auth styling has no atmospheric grid or glow', () => {
  const background = read('app/(auth)/components/AuthBackground.tsx');
  const runtimeMarkup = background.replace(/never Blue atmosphere, glow, or decorative grid effects\./i, '');
  assert.equal(/radial|gradient|glow|grid/i.test(runtimeMarkup), false);
});
