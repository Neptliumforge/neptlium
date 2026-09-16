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
const bootstrap = read('lib/product/bootstrap.ts');
const provider = read('components/product/ProductBootstrapProvider.tsx');
const experience = read('components/product/OperatingExperience.tsx');
const css = read('app/authenticated-product.css');

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
    'Activity',
    'More',
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
  assert.match(experience, /Canonical valuation unavailable/);
  assert.match(experience, /No decorative or interpolated performance curve is rendered/);
  assert.match(experience, /Unknown allocation is not rendered as zero/);
  assert.match(experience, /MODEL/);
  assert.match(experience, /RECONCILE/);
  assert.doesNotMatch(experience, /liquidity-curve/);
});

test('high-value actions are capability gated', () => {
  assert.match(experience, /const canFund = funding\.length > 0/);
  assert.match(experience, /const canMove = transfers\.length > 0/);
  assert.match(experience, /state === 'ENABLED'/);
  assert.match(experience, /Review funding/);
});

test('authenticated product keeps the carbon and mineral-teal system', () => {
  assert.match(css, /--color-canvas:#050505/);
  assert.match(css, /--color-text-primary:#f7f7f3/);
  assert.match(css, /--color-accent-primary:#35d5c1/);
  assert.doesNotMatch(css, /backdrop-filter:.*blur\(2[0-9]/i);
});
