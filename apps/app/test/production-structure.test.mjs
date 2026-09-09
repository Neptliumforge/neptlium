import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

test('authenticated application enforces neutral operating authority', () => {
  const global = read('app/global.css');
  const icon = read('public/icon.svg');
  const uiPackage = read('../../packages/ui/package.json');
  assert.equal(global.includes("@import '@neptlium/ui/styles/brand.css'"), true);
  assert.equal(global.includes('--color-accent-primary: var(--n-carbon)'), true);
  assert.equal(global.includes('--color-accent-primary-hover: #26292b'), true);
  assert.equal(global.includes('--color-canvas: var(--n-canvas)'), true);
  assert.equal(global.includes('--color-sidebar: #f5f3ee'), true);
  assert.equal(global.includes('--color-topnav: rgb(255 255 255 / 96%)'), true);
  assert.equal(global.includes('#258BE5'), false);
  assert.equal(global.includes('#319EED'), false);
  assert.equal(uiPackage.includes('"./styles/brand.css"'), true);
  assert.equal(icon.includes('#101214'), true);
  assert.equal(icon.includes('#F5F3EE'), true);
  assert.equal(/gradient|radial|crystalline|glow/i.test(global), false);
});

test('primary authenticated navigation reflects the institutional operating model', () => {
  const nav = read('components/navigation/dashboardNav.tsx');

  for (const label of [
    'Overview',
    'Capital Account',
    'Treasury',
    'Company Intelligence',
    'Allocation',
    'Portfolio Intelligence',
  ]) {
    assert.equal(nav.includes(`label: '${label}'`), true, `missing ${label}`);
  }

  for (const group of ['Overview', 'Capital', 'Investment context']) {
    assert.equal(nav.includes(`group: '${group}'`), true, `missing ${group} group`);
  }

  for (const secondary of ['Activity', 'Notifications', 'Documents', 'Settings']) {
    assert.equal(nav.includes(`label: '${secondary}'`), true, `missing ${secondary}`);
  }

  const mobilePrimary = nav.slice(
    nav.indexOf('dashboardMobilePrimaryNavItems'),
    nav.indexOf('dashboardSecondaryNavItems'),
  );

  for (const mobile of [
    'Overview',
    'Capital Account',
    'Treasury',
    'Company Intelligence',
    'Allocation',
    'Portfolio Intelligence',
  ]) {
    assert.equal(mobilePrimary.includes(`label: '${mobile}'`), true, `missing mobile ${mobile}`);
  }

  assert.equal((mobilePrimary.match(/href:/g) ?? []).length, 6);
});

test('authenticated shell preserves institutional desktop and mobile governance', () => {
  const layout = read('app/dashboard/layout.tsx');
  const mobile = read('../../packages/ui/src/shell/MobileNavigation.tsx');
  const shell = read('../../packages/ui/src/shell/AppShell.tsx');
  const sidebar = read('../../packages/ui/src/shell/Sidebar.tsx');
  const global = read('app/global.css');
  assert.equal(layout.includes('dashboardSecondaryNavItems'), true);
  assert.equal(layout.includes('brandDescriptor="Capital intelligence"'), true);
  assert.equal(layout.includes('brandTone="teal"'), true);
  assert.equal(layout.includes('Current operating context'), false);
  assert.equal(layout.includes('sidebarFooter='), true);
  assert.equal(mobile.includes('grid-cols-5'), true);
  assert.equal(global.includes('grid-template-columns: repeat(5, minmax(0, 1fr))'), false);
  assert.equal(mobile.includes('env(safe-area-inset-bottom)'), true);
  assert.equal(mobile.includes('100dvh'), true);
  assert.equal(mobile.includes('document.body.style.overflow = "hidden"'), true);
  assert.equal(mobile.includes('event.key === "Escape"'), true);
  assert.equal(mobile.includes('triggerRef.current?.focus()'), true);
  assert.equal(shell.includes('w-[68px]'), true);
  assert.equal(shell.includes('xl:w-[228px]'), true);
  assert.equal(shell.includes('max-w-[1400px]'), true);
  assert.equal(shell.includes('overflow-x-hidden'), true);
  assert.equal(shell.includes('aria-label="Workspace navigation"'), true);
  assert.equal(sidebar.includes('rounded-md px-3 py-2'), false);
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
  assert.equal(
    layout.includes(
      "preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'",
    ),
    true,
  );
  assert.equal(profile.includes("localStorage.setItem('neptlium-theme', next)"), true);
  assert.equal(profile.includes('document.documentElement.dataset.themePreference = theme'), true);
  assert.equal(profile.includes("media.addEventListener('change', synchronize)"), true);
  assert.equal(profile.includes("media.removeEventListener('change', synchronize)"), true);
});

test('product-wide state vocabulary is explicit and non-color-only', () => {
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

test('all five primary workspaces use the shared information-first header', () => {
  const header = read('components/product/WorkspaceHeader.tsx');
  assert.equal(header.includes('border-b border-border-hairline'), true);
  assert.equal(header.includes('uppercase'), false);
  for (const path of [
    'app/dashboard/page.tsx',
    'app/dashboard/portfolio/page.tsx',
    'app/dashboard/treasury/TreasuryView.tsx',
  ]) {
    assert.equal(
      read(path).includes('WorkspaceHeader'),
      true,
      `${path} does not use WorkspaceHeader`,
    );
  }
  assert.equal(
    read('app/dashboard/capital-account/CapitalAccountView.tsx').includes('WorkspaceHeader'),
    true,
  );
  assert.equal(
    read('components/product/AllocationIntelligence.tsx').includes('WorkspaceHeader'),
    true,
  );
});

test('Overview is a governed capital operating home without fabricated valuation or execution actions', () => {
  const overview = read('app/dashboard/page.tsx');

  // The page represents operating context and keeps attention explicit without manufacturing an issue.
  assert.equal(overview.includes('Capital Operating Environment'), true);
  assert.equal(
    overview.includes('Understand current capital state, changes, and attention areas.'),
    true,
  );
  assert.equal(overview.includes('No items require your attention.'), true);
  assert.equal(overview.includes('require review'), true);

  // Financial truth crosses the authenticated Neptlium API boundary.
  assert.equal(overview.includes('getOverviewState'), true);
  assert.equal(overview.includes('getCanonicalBalances'), true);
  assert.equal(overview.includes('getFundingCapabilities'), true);
  assert.equal(overview.includes('getTransferCapabilities'), true);
  assert.equal(overview.includes('getFundingActivity'), true);
  assert.equal(overview.includes('getTransferActivity'), true);

  // Missing canonical state must never become a fabricated valuation or numeric zero.
  assert.equal(overview.includes("?? '0'"), false);
  assert.equal(overview.includes('FinancialValue'), false);
  for (const forbidden of ['Total balance', 'Net worth', 'Performance', 'Gain/loss']) {
    assert.equal(
      overview.includes(forbidden),
      false,
      `Overview contains fabricated valuation concept: ${forbidden}`,
    );
  }

  // Capital is represented as governed state, not wealth.
  for (const state of ['Capital state', 'Portfolio', 'Liquidity', 'Allocation', 'Treasury']) {
    assert.equal(overview.includes(state), true, `missing capital state ${state}`);
  }
  assert.equal(overview.includes("item.state === 'ENABLED'"), true);

  // Core governed workspaces remain directly reachable.
  for (const href of [
    '/dashboard/capital-account',
    '/dashboard/treasury',
    '/dashboard/allocations',
    '/dashboard/portfolio',
  ]) {
    assert.equal(overview.includes(href), true, `missing workspace link ${href}`);
  }

  for (const workspace of [
    'Portfolio Intelligence',
    'Understand positions and exposure.',
    'Understand funding, availability, and movement capability.',
    'Understand policy and structure.',
    'Understand movement capability and controls.',
  ]) {
    assert.equal(overview.includes(workspace), true, `missing workspace contract: ${workspace}`);
  }

  // Recent context is not a transaction feed and the Overview exposes no execution shortcut.
  assert.equal(overview.includes('Capital context'), true);
  for (const forbidden of [
    'View all activity',
    'Fund capital',
    '#deposit',
    'Invest now',
    'Deposit now',
    'Move funds',
  ]) {
    assert.equal(
      overview.includes(forbidden),
      false,
      `Overview contains execution action: ${forbidden}`,
    );
  }
});

test('Capital Account is the API-authoritative funding and movement workspace', () => {
  const page = read('app/dashboard/capital-account/page.tsx');
  const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  for (const contract of [
    'getCanonicalBalances',
    'getFundingCapabilities',
    'getFundingActivity',
    'getTransferCapabilities',
    'getTransferActivity',
    'getTransferAliases',
  ])
    assert.equal(page.includes(contract), true, `missing ${contract}`);
  for (const tab of ['Capital State', 'Funding', 'Movement', 'Destinations', 'Capital Context'])
    assert.equal(view.includes(`'${tab}'`), true, `missing ${tab}`);
  assert.equal(view.includes('CapitalAccountView'), true);
  assert.equal(view.includes('WalletView'), false);
  assert.equal(view.includes('productStateFromCapability'), true);
  assert.equal(view.includes('No execution action is exposed here'), true);
});

test('Funding UX is capability-driven, copyable, and never hardcodes a treasury destination', () => {
  const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  const actions = read('app/dashboard/capital-account/actions.ts');
  const financial = read('lib/api/financial.ts');
  assert.equal(view.includes('capabilities.map'), true);
  assert.equal(view.includes('deposit_address'), true);
  assert.equal(view.includes('memo_or_tag'), true);
  assert.equal(view.includes('navigator.clipboard.writeText'), true);
  assert.equal(view.includes('createFundingIntentAction'), true);
  assert.equal(actions.includes('createFundingIntent'), true);
  assert.equal(actions.includes('getDepositInstructionsForIntent'), true);
  assert.equal(actions.includes('/v1/'), false);
  assert.equal(financial.includes('/v1/funding/intents'), true);
  assert.equal(financial.includes('/v1/capital-account/deposit-instructions'), true);
  assert.equal(financial.includes('/v1/capital-account/provider-wallet'), false);
  assert.equal(financial.includes('/v1/wallet/withdrawals'), false);
  assert.equal(/bc1[a-z0-9]{10,}/i.test(view), false);
  assert.equal(/0x[a-f0-9]{20,}/i.test(view), false);
  assert.equal(/['"`]r[A-HJ-NP-Za-km-z1-9]{24,34}['"`]/.test(view), false);
});

test('Withdrawal UX never manufactures availability and remains inert before reservation API support', () => {
  const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  const actions = read('app/dashboard/capital-account/actions.ts');
  assert.equal(view.includes("active === 'Movement'"), true);
  assert.equal(view.includes('Select verified destination'), true);
  assert.equal(view.includes('productStateFromCapability'), true);
  assert.equal(/<Button[^>]*>\s*Request movement\s*<\/Button>/.test(view), false);
  assert.equal(view.includes('valueAtomic={selectedTransferBalance.available_atomic}'), true);
  assert.equal(view.includes("selectedTransferBalance ? '0'"), false);
  assert.equal(view.includes("selectedTransferBalance.available_atomic ?? '0'"), false);
  assert.equal(actions.includes('/v1/treasury/transfers'), false);
  assert.equal(actions.includes('transfer_executions'), false);
});

test('Destination management uses governed alias persistence without pretending verification', () => {
  const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  const actions = read('app/dashboard/capital-account/actions.ts');
  const financial = read('lib/api/financial.ts');
  assert.equal(view.includes("active === 'Destinations'"), true);
  assert.equal(view.includes('createTransferAliasAction'), true);
  assert.equal(actions.includes('createTransferAlias'), true);
  assert.equal(actions.includes('/v1/'), false);
  assert.equal(financial.includes('/v1/treasury/aliases'), true);
  assert.equal(view.includes('Saving a destination does not verify ownership'), true);
  assert.equal(view.includes('Verification and activation are shown separately.'), true);
});

test('legacy capital routes converge on governed workspaces', () => {
  assert.equal(
    read('app/dashboard/deposit/page.tsx').includes(
      "redirect('/dashboard/capital-account#funding')",
    ),
    true,
  );
  assert.equal(
    read('app/dashboard/withdrawals/page.tsx').includes(
      "redirect('/dashboard/capital-account#movement')",
    ),
    true,
  );
  assert.equal(
    read('app/dashboard/wallet/page.tsx').includes("redirect('/dashboard/capital-account')"),
    true,
  );
  assert.equal(
    read('app/dashboard/transfer/page.tsx').includes("redirect('/dashboard/treasury')"),
    true,
  );
});

test('Portfolio is an API-authoritative intelligence surface without execution actions', () => {
  const portfolio = read('app/dashboard/portfolio/page.tsx');
  const components = read('components/product/PortfolioIntelligence.tsx');
  const surface = `${portfolio}\n${components}`;
  assert.equal(portfolio.includes('getPortfolioState'), true);
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
  assert.equal(portfolio.includes('getAllocationWorkspace'), true);
  assert.equal(portfolio.includes('Portfolio Intelligence'), true);
  assert.equal(
    portfolio.includes('Understand holdings, exposure, relationships, and strategic position.'),
    true,
  );
  for (const section of [
    'PortfolioState',
    'HoldingsTable',
    'ExposurePanel',
    'AttentionState',
    'PortfolioContext',
  ])
    assert.equal(portfolio.includes(section), true, `missing ${section}`);
  for (const column of ['Asset', 'Quantity', 'Source', 'Status'])
    assert.equal(components.includes(`>${column}<`), true, `missing ${column}`);
  assert.equal(components.includes('No portfolio positions are currently available.'), true);
  assert.equal(components.includes('No portfolio items require attention.'), true);
  assert.equal(portfolio.includes("balance?.available_atomic ?? '0'"), false);
  for (const forbidden of [
    '#deposit',
    'Fund capital',
    '>Deposit<',
    '>Withdraw<',
    '>Buy<',
    '>Sell<',
    '>Trade<',
    'Execute allocation',
    'candlestick',
    'market ticker',
  ])
    assert.equal(surface.includes(forbidden), false, `portfolio contains ${forbidden}`);
});

test('Treasury preserves liquidity and movement-governance semantics in production language', () => {
  const treasury = read('app/dashboard/treasury/TreasuryView.tsx');
  assert.equal(treasury.includes('Liquidity and movement'), true);
  assert.equal(treasury.includes('Transfers and destinations'), true);
  assert.equal(treasury.includes('Verified destinations'), true);
  assert.equal(treasury.includes('No capital positions yet'), true);
  assert.equal(
    treasury.includes('Reservation and approval remain separate from submission.'),
    true,
  );
  assert.equal(treasury.includes('/dashboard/capital-account#movement'), true);
  assert.equal(treasury.includes('/dashboard/capital-account#destinations'), true);
  assert.equal(treasury.includes('/dashboard/wallet#'), false);
});

test('Activity is sourced from governed funding and transfer APIs', () => {
  const page = read('app/dashboard/transactions/page.tsx');
  assert.equal(page.includes('getFundingActivity'), true);
  assert.equal(page.includes('getTransferActivity'), true);
  assert.equal(page.includes('getCapitalActivity'), false);
  assert.equal(page.includes('No capital activity yet'), true);
});

test('Allocation exposes policy, decision intelligence, lifecycle truth, and an execution gate', () => {
  const allocation = read('app/dashboard/allocations/AllocationWorkspace.tsx');
  const intelligence = read('components/product/AllocationIntelligence.tsx');
  const surface = `${allocation}\n${intelligence}`;
  for (const label of [
    'Observed',
    'Modeled',
    'Authorized',
    'Executed',
    'Reconciled',
    'Reserve',
    'Core',
    'Growth',
    'Opportunity',
    'Restricted',
  ])
    assert.equal(surface.includes(label), true, `Allocation missing ${label}`);
  for (const section of [
    'Observed Capital',
    'Capital Policy',
    'Decision Intelligence',
    'Modeled Decisions',
    'Allocation Context',
  ])
    assert.equal(surface.includes(section), true, `Allocation missing ${section}`);
  assert.equal(allocation.includes('Execution unavailable'), true);
  assert.equal(allocation.includes('Authorization records an approved decision'), true);
});

test('dashboard loading state does not impersonate financial cards or values', () => {
  const loading = read('app/dashboard/loading.tsx');
  assert.equal(loading.includes('Loading capital state'), true);
  assert.equal(loading.includes('Retrieving governed account'), true);
  assert.equal(/\$[0-9]|[0-9]+(?:\.[0-9]+)?%/.test(loading), false);
  assert.equal(loading.includes('grid-cols-4'), false);
});

test('auth styling has no atmospheric gradient or glow', () => {
  const shell = read('app/(auth)/components/AuthShell.tsx');
  const background = read('app/(auth)/components/AuthBackground.tsx');
  const runtimeMarkup = `${shell}\n${background}`.replace(
    /never Blue atmosphere, glow, or decorative grid effects\./i,
    '',
  );
  assert.equal(/radial-gradient|linear-gradient|\bglow\b/i.test(runtimeMarkup), false);
});
