import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const layout = read('app/dashboard/layout.tsx');
const nav = read('components/navigation/dashboardNav.tsx');
const mobile = read('components/navigation/ProductMobileNavigation.tsx');
const profileMenu = read('components/navigation/ProfileMenu.tsx');
const bootstrap = read('lib/product/bootstrap.ts');
const provider = read('components/product/ProductBootstrapProvider.tsx');
const experience = read('components/product/OperatingExperience.tsx');
const css = read('app/authenticated-product.css');
const mobileCss = read('app/authenticated-mobile.css');
const tokens = read('../../packages/ui/src/styles/tokens.css');

test('authenticated shell loads a shared account bootstrap once at layout authority', () => {
  assert.match(layout, /getAuthenticatedProductBootstrap/);
  assert.match(layout, /ProductBootstrapProvider/);
  assert.match(bootstrap, /Promise\.allSettled/);
  assert.match(bootstrap, /getCanonicalBalances/);
  assert.match(bootstrap, /getPortfolioState/);
  assert.match(bootstrap, /getNotifications/);
  assert.match(bootstrap, /getDocuments/);
});

test('authenticated bootstrap refreshes without per-route blocking loaders', () => {
  assert.match(provider, /setInterval\(refresh,\s*60_000\)/);
  assert.match(provider, /document\.visibilityState === 'visible'/);
  assert.match(provider, /router\.refresh\(\)/);
});

test('desktop and mobile navigation use the personal Capital hierarchy', () => {
  for (const label of [
    'Overview',
    'Portfolio',
    'Invest',
    'Capital',
    'Activity',
    'Help & Support',
    'Settings',
  ]) {
    assert.match(nav, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(nav, /label: 'Treasury'/);
  assert.doesNotMatch(nav, /href: '\/dashboard\/treasury'/);
  for (const label of ['Overview', 'Portfolio', 'Invest', 'Activity', 'More']) {
    assert.match(nav, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(mobile, /Menu|drawer|dialog|aria-modal/i);
});

test('portfolio and allocation surfaces fail truthfully when canonical data is unavailable', () => {
  assert.match(experience, /Portfolio valuation is not available yet/);
  assert.match(experience, /No decorative or interpolated performance curve is rendered/);
  assert.match(experience, /Unknown allocation is not rendered as zero/);
  assert.match(experience, /Allocation information is not currently available for this account/);
  assert.doesNotMatch(experience, /Governed progression/);
  assert.doesNotMatch(experience, /liquidity-curve/);
});

test('high-value actions are capability gated', () => {
  assert.match(experience, /const canMove = transfers\.length > 0/);
  assert.match(experience, /state === 'ENABLED'/);
  assert.match(experience, /Add funds/);
  assert.doesNotMatch(experience, /Review funding/);
});

test('authenticated product keeps the carbon and mineral-teal system', () => {
  assert.match(tokens, /--n-canvas:\s*#0b0c0e/);
  assert.match(tokens, /--n-warm-white:\s*#f0f0e8/);
  assert.match(tokens, /--n-teal-primary:\s*#4a9992/);
  assert.match(css, /var\(--color-accent-primary\)/);
  assert.match(css, /\.neptlium-environment main\{background:var\(--color-canvas\)\}/);
  assert.doesNotMatch(css, /--color-canvas:|--color-surface-2:|--color-text-secondary:#/);
  assert.doesNotMatch(css, /#050505/i);
  assert.doesNotMatch(css, /backdrop-filter:.*blur\(2[0-9]/i);
});


test('account appearance delegates to shared theme authority', () => {
  assert.match(profileMenu, /useTheme/);
  assert.match(profileMenu, /preference, setPreference/);
  assert.doesNotMatch(profileMenu, /localStorage|matchMedia|document\.documentElement|function applyTheme/);
});

test('authenticated shell consumes semantic light and dark tokens without a local dark palette', () => {
  assert.match(css, /background:var\(--color-canvas\)/);
  assert.doesNotMatch(css, /--color-canvas:var\(--n-canvas\)/);
  assert.doesNotMatch(css, /--color-text-secondary:#|--color-border-hairline:rgba\(255/);
  assert.doesNotMatch(css, /\.op-more-grid>a:hover\{background:#111\}/);
});

test('mobile primary navigation has durable thumb targets and five-item hierarchy', () => {
  assert.match(mobileCss, /\.product-mobile-bottom>a\{[^}]*min-height:3\.75rem/s);
  assert.match(mobileCss, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(mobileCss, /background:var\(--color-surface-1\)/);
  assert.match(mobileCss, /color:var\(--color-accent-primary\)/);
  assert.doesNotMatch(mobileCss, /rgba\(5,5,5|#35d5c1/i);
  assert.match(mobile, /aria-current=\{isActive \? 'page' : undefined\}/);
});
