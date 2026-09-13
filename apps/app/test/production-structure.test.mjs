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
  assert.match(global, /@import '@neptlium\/ui\/styles\/brand\.css'/);
  assert.match(global, /--color-accent-primary: var\(--n-carbon\)/);
  assert.match(global, /--color-canvas: var\(--n-canvas\)/);
  assert.match(global, /--color-sidebar: #f5f3ee/);
  assert.doesNotMatch(global, /#258BE5|#319EED/);
  assert.match(uiPackage, /"\.\/styles\/brand\.css"/);
  assert.match(icon, /#101214/);
  assert.match(icon, /#F5F3EE/);
  assert.doesNotMatch(global, /gradient|radial|crystalline|glow/i);
});

test('desktop authenticated navigation reflects the final product hierarchy', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  const expected = [
    ['Overview', '/dashboard', 'Overview'],
    ['Capital', '/dashboard/capital', 'Capital'],
    ['Treasury', '/dashboard/treasury', 'Capital'],
    ['Portfolio', '/dashboard/portfolio', 'Invest'],
    ['Allocation', '/dashboard/allocation', 'Invest'],
    ['Companies', '/dashboard/companies', 'Invest'],
    ['Activity', '/dashboard/activity', 'Records'],
    ['Documents', '/dashboard/documents', 'Records'],
    ['Notifications', '/dashboard/notifications', 'Records'],
  ];
  for (const [label, href, group] of expected) {
    assert.match(nav, new RegExp(`label: '${label}'.*href: '${href}'.*group: '${group}'`));
  }
  assert.match(nav, /label: 'Settings'.*href: '\/dashboard\/settings'.*group: 'Account'/);
});

test('mobile navigation is Home Capital Portfolio Activity More with governed secondary routes', () => {
  const nav = read('components/navigation/dashboardNav.tsx');
  const primary = nav.slice(nav.indexOf('dashboardMobilePrimaryNavItems'), nav.indexOf('dashboardMobileSecondaryNavItems'));
  for (const [label, href] of [
    ['Home', '/dashboard'], ['Capital', '/dashboard/capital'], ['Portfolio', '/dashboard/portfolio'],
    ['Activity', '/dashboard/activity'], ['More', '/dashboard/more'],
  ]) assert.match(primary, new RegExp(`label: '${label}'.*href: '${href}'`));
  assert.equal((primary.match(/href:/g) ?? []).length, 5);

  const more = read('components/product/OperatingExperience.tsx');
  for (const route of ['/dashboard/treasury', '/dashboard/allocation', '/dashboard/companies', '/dashboard/documents', '/dashboard/notifications', '/dashboard/settings']) {
    assert.match(more, new RegExp(route.replaceAll('/', '\\/')));
  }
});

test('authenticated shell preserves keyboard access, stable shared bootstrap and responsive containment', () => {
  const layout = read('app/dashboard/layout.tsx');
  const provider = read('components/product/ProductBootstrapProvider.tsx');
  const shell = read('../../packages/ui/src/shell/AppShell.tsx');
  const global = read('app/global.css');

  assert.match(layout, /ProductBootstrapProvider/);
  assert.match(layout, /brandDescriptor="Capital operating environment"/);
  assert.match(layout, /brandTone="teal"/);
  assert.match(layout, /Skip to application workspace/);
  assert.match(layout, /id="app-workspace"/);
  assert.match(layout, /tabIndex=\{-1\}/);
  assert.match(provider, /window\.setInterval\(refresh, 60_000\)/);
  assert.match(provider, /window\.addEventListener\('focus', refresh\)/);
  assert.match(provider, /document\.visibilityState === 'visible'/);
  assert.match(shell, /overflow-x-hidden/);
  assert.match(shell, /max-w-\[1400px\]/);
  assert.match(global, /\.app-skip-link:focus-visible/);
});

test('product-wide state vocabulary remains explicit and non-color-only', () => {
  const productState = read('components/product/ProductState.tsx');
  for (const state of [
    'LOADING', 'AVAILABLE', 'READY', 'PENDING', 'AWAITING_PROVISIONING', 'CAPABILITY_DISABLED',
    'RESERVED', 'RESTRICTED', 'REQUIRES_APPROVAL', 'NOT_CONFIGURED', 'INELIGIBLE',
    'UNAVAILABLE', 'NO_ACTIVITY', 'NO_POSITION', 'ERROR',
  ]) assert.match(productState, new RegExp(`'${state}'`));
  assert.match(productState, /role=\{state === 'ERROR' \? 'alert'/);
  assert.match(productState, /state === 'LOADING' \? 'status'/);
});

test('Overview is a shared-bootstrap capital home without fabricated valuation', () => {
  const page = read('app/dashboard/page.tsx');
  const bootstrap = read('lib/product/bootstrap.ts');
  const experience = read('components/product/OperatingExperience.tsx');

  assert.match(page, /OverviewExperience/);
  for (const source of ['getOverviewState()', 'getCanonicalBalances()', 'getFundingCapabilities()', 'getTransferCapabilities()', 'getFundingActivity()', 'getTransferActivity()']) {
    assert.equal(bootstrap.includes(source), true, `missing shared bootstrap source ${source}`);
  }
  assert.match(experience, /Total canonical capital/);
  assert.match(experience, /Assets remain separated without an authoritative conversion basis/);
  assert.match(experience, /Portfolio history is not available yet/);
  assert.doesNotMatch(experience, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
  assert.doesNotMatch(page, /getCanonicalBalances|getFundingCapabilities|getTransferCapabilities/);
});

test('Capital and Treasury keep financial actions capability-driven and failure-aware', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  assert.match(experience, /item\.state === 'ENABLED'/);
  assert.match(experience, /Funding capability unavailable/);
  assert.match(experience, /Transfer capability unavailable/);
  assert.match(experience, /authoritative capability response contains no funding routes/i);
  assert.match(experience, /Outbound capability unavailable/);
  assert.doesNotMatch(experience, /Request movement/);
});

test('Portfolio remains evidence-aware and contains no execution authority', () => {
  const page = read('app/dashboard/portfolio/page.tsx');
  const experience = read('components/product/OperatingExperience.tsx');
  assert.match(page, /PortfolioExperience/);
  assert.match(experience, /Canonical valuation unavailable/);
  assert.match(experience, /Reconciled valuation history is not available/);
  assert.match(experience, /No canonical positions are available/);
  assert.match(experience, /Unknown allocation is not rendered as zero/);
  assert.doesNotMatch(experience, />Buy<|>Sell<|>Trade<|Execute allocation/);
});

test('Allocation preserves MODEL REVIEW APPROVE RESERVE EXECUTE RECONCILE distinctions', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  assert.match(experience, /\['MODEL','REVIEW','APPROVE','RESERVE','EXECUTE','RECONCILE'\]/);
  assert.match(experience, /Model, approval, reservation, execution and reconciliation remain distinct governed states/);
  assert.match(experience, /Observed allocation unavailable/);
});

test('legacy detailed capital workspace remains governed and provider-neutral', () => {
  const view = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  const actions = read('app/dashboard/capital-account/actions.ts');
  assert.match(view, /productStateFromCapability/);
  assert.match(view, /No execution action is exposed here/);
  assert.match(view, /Reviewing a movement does not reserve or move capital/);
  assert.doesNotMatch(actions, /\/v1\//);
  assert.doesNotMatch(actions, /circle|alchemy|stripe|supabase/i);
});

test('dashboard loading does not impersonate financial state', () => {
  const loading = read('app/dashboard/loading.tsx');
  assert.doesNotMatch(loading, /\$0|0\.00%|Total balance|Net worth/);
});
