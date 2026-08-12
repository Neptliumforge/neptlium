import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const site = read('lib/content/site.ts');
const productionCss = read('app/marketing-production.css');
const homeCss = read('app/marketing-home.css');
const brand = read('../../packages/ui/src/styles/brand.css');
const shell = `${page}\n${header}\n${footer}\n${site}\n${productionCss}\n${homeCss}`;

test('marketing doctrine hero uses the canonical proposition and one H1', () => {
  assert.match(page, /DIGITAL CAPITAL OPERATING INFRASTRUCTURE/);
  assert.match(page, /Capital, organized around you\./);
  assert.match(page, /Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(page, /Capital, operated as one system\./);
});

test('homepage is exactly six major compositions with canonical copy', () => {
  assert.equal((page.match(/data-composition="[1-6]"/g) ?? []).length, 6);
  for (const copy of [
    'Digital capital is fragmented by default.',
    'One system for understanding and operating capital.',
    'Structure capital. Govern policy. Connect infrastructure.',
    'Control is part of the architecture.',
    'Operate digital capital with greater control.',
  ]) assert.match(page, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('capital thesis and allocation lifecycle remain explicit and truthful', () => {
  for (const stage of ['Capital sources', 'Connectivity', 'Portfolio', 'Treasury', 'Policy', 'Allocation', 'Authorization', 'Operational record']) {
    assert.match(page, new RegExp(stage));
  }
  for (const state of ['Observe', 'Model', 'Authorize']) assert.match(page, new RegExp(state));
  assert.match(page, /Authorization does not imply autonomous execution or active rebalancing\./);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|candlestick|ticker/i);
});

test('hero actions use real destinations and do not imitate a dashboard', () => {
  assert.match(page, /Explore Neptlium/);
  assert.match(page, /Enter the App/);
  assert.match(page, /href="\/platform"/);
  assert.match(site, /https:\/\/app\.neptlium\.com\/auth\/sign-in/);
  assert.match(page, /HeroCapitalSystem/);
  assert.doesNotMatch(page, /dashboard screenshot|OperatingEnvironmentVisual/i);
});

test('navigation uses the canonical marketing information architecture', () => {
  for (const section of ['Platform', 'Capital', 'Connectivity', 'Governance', 'Company']) assert.match(header, new RegExp(`label: '${section}'`));
  assert.match(header, /Enter App/);
  assert.match(header, /aria-expanded=/);
  assert.match(header, /aria-controls=/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key === 'Escape'/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /trigger\.current\?\.focus\(\)/);
});

test('canonical brand palette is owned by shared brand tokens', () => {
  for (const value of ['#011255','#011d85','#012abd','#0141f3','#026ffa','#11a3f9','#53d1f8','#c0f5fc','#08111f','#39475a','#68758a','#dce4ef','#c8d9ff']) {
    assert.equal(brand.includes(value), true, `Missing canonical brand token value ${value}`);
  }
  assert.match(productionCss, /@import '\.\.\/\.\.\/\.\.\/packages\/ui\/src\/styles\/brand\.css';/);
  assert.match(productionCss, /--np-blue: var\(--n-brand-blue\)/);
  assert.match(productionCss, /--np-paper: var\(--n-brand-canvas\)/);
  assert.match(productionCss, /--np-ink: var\(--n-brand-ink\)/);
  assert.doesNotMatch(`${productionCss}\n${homeCss}`, /#2764ff|#147dff/i);
});

test('minimal footer includes only verified destinations', () => {
  assert.match(footer, /Privacy/);
  assert.match(footer, /https:\/\/github\.com\/Neptliumlabs/);
  assert.doesNotMatch(footer, /Instagram|\bX\b|Careers/);
  assert.doesNotMatch(footer, /href=["']#["']/);
});

test('homepage responsiveness and reduced motion are explicit', () => {
  assert.match(homeCss, /@media \(max-width: 1024px\)/);
  assert.match(homeCss, /@media \(max-width: 768px\)/);
  assert.match(homeCss, /@media \(max-width: 430px\)/);
  assert.match(homeCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test('marketing positioning remains canonical and shell has no placeholder destinations', () => {
  assert.match(site, /Digital capital, organized with institutional intelligence\./);
  assert.match(site, /Neptlium helps users understand, organize, govern and operate digital capital through one controlled capital environment\./);
  assert.doesNotMatch(shell, /href=["']#["']/);
});
