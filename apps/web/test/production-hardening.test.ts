import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains the complete indexable public product surface', () => {
  const sitemap = read('app/sitemap.ts');
  for (const route of ['/platform','/portfolio-intelligence','/capital-account','/capital-activity','/neptlium-link','/allocation','/treasury','/capital-universe','/research','/learn','/company','/about','/security','/trust','/contact']) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }
  assert.equal(sitemap.includes("'/pricing'"), false);
});

test('navigation exposes only the locked public categories and preserves accessibility controls', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Solutions', 'Company']) assert.equal(header.includes(`label: '${section}'`), true);
  for (const removed of ['Capital', 'Connectivity', 'Governance']) assert.equal(header.includes(`label: '${removed}'`), false);
  assert.equal(header.includes('links: readonly [NavLink, NavLink]'), true);
  assert.equal(header.includes('Explore the platform'), true);
  assert.equal(header.includes('Enter Neptlium'), true);
  assert.equal(header.includes('Talk to Neptlium'), true);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', dismiss)"), true);
});

test('homepage carries canonical positioning through exactly six truthful compositions', () => {
  const page = read('app/page.tsx');
  assert.equal(page.includes('Capital, organized around you.'), true);
  assert.equal(page.includes('DIGITAL CAPITAL OPERATING INFRASTRUCTURE'), true);
  assert.equal(page.includes('Explore the platform'), true);
  assert.equal(page.includes('Enter Neptlium'), true);
  assert.equal(page.includes('Talk to Neptlium'), true);
  assert.equal(page.includes('HeroCapitalSystem'), true);
  assert.equal((page.match(/data-composition="[1-6]"/g) ?? []).length, 6);
  for (const stage of ['Fragmentation', 'Understanding', 'Organization', 'Intelligence', 'Policy', 'Control', 'Operation']) assert.equal(page.includes(`'${stage}'`), true, `Missing narrative stage: ${stage}`);
  assert.equal(page.includes('Digital capital is fragmented by default.'), true);
  assert.equal(page.includes('Understand capital. Then organize it.'), true);
  assert.equal(page.includes('Turn structure into governed decisions.'), true);
  assert.equal(page.includes('Control is part of the architecture.'), true);
  assert.equal(page.includes('Capital, made operational.'), true);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD']) assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
});

test('footer is corporate closure using only verified destinations', () => {
  const footer = read('components/site-footer.tsx');
  for (const label of ["label: 'Legal'", "label: 'Corporate'", "label: 'Social'", "label: 'Privacy'", "label: 'About'", "label: 'Contact'", "label: 'GitHub'"]) assert.equal(footer.includes(label), true);
  assert.equal(footer.includes('https://github.com/Neptliumlabs'), true);
  for (const forbidden of ['Instagram', "label: 'X'", 'Careers', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation', 'Wallet']) assert.equal(footer.includes(forbidden), false);
});

test('production marketing resolves through shared brand authority and the unified design layer', () => {
  const productionCss = read('app/marketing-production.css');
  const unifiedCss = read('app/unified-design.css');
  assert.equal(productionCss.includes("@import '../../../packages/ui/src/styles/brand.css';"), true);
  assert.equal(unifiedCss.includes('--np-paper: var(--n-brand-canvas)'), true);
  assert.equal(unifiedCss.includes('--np-ink: var(--n-brand-ink)'), true);
  assert.equal(unifiedCss.includes('--np-action: var(--n-brand-blue)'), true);
  assert.equal(unifiedCss.includes('background-image: none !important'), true);
  assert.equal(unifiedCss.includes('box-shadow: none !important'), true);
  assert.equal(unifiedCss.includes('prefers-reduced-motion: reduce'), true);
});

test('canonical public metadata stays wired to production domain and light-first browser chrome', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(site.includes('Digital capital, organized with institutional intelligence.'), true);
  assert.equal(layout.includes("metadataBase: new URL(SITE.url)"), true);
  assert.equal(layout.includes("import './unified-design.css';"), true);
  assert.equal(layout.includes("colorScheme: 'light'"), true);
  assert.equal(layout.includes('data-theme="light"'), true);
  assert.equal(layout.includes("themeColor: '#FFFFFF'"), true);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
});
