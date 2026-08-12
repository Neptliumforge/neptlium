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

test('navigation exposes governed production categories and accessibility controls', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Capital', 'Connectivity', 'Governance', 'Company']) assert.equal(header.includes(`label: '${section}'`), true);
  assert.equal(header.includes('Enter App'), true);
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
  assert.equal(page.includes('Explore Neptlium'), true);
  assert.equal(page.includes('Enter the App'), true);
  assert.equal(page.includes('HeroCapitalSystem'), true);
  assert.equal((page.match(/data-composition="[1-6]"/g) ?? []).length, 6);
  assert.equal(page.includes('Digital capital is fragmented by default.'), true);
  assert.equal(page.includes('One system for understanding and operating capital.'), true);
  assert.equal(page.includes('Structure capital. Govern policy. Connect infrastructure.'), true);
  assert.equal(page.includes('Control is part of the architecture.'), true);
  assert.equal(page.includes('Operate digital capital with greater control.'), true);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD']) assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
});

test('footer remains minimal and uses only verified destinations', () => {
  const footer = read('components/site-footer.tsx');
  assert.equal(footer.includes("label: 'Privacy'"), true);
  assert.equal(footer.includes('https://github.com/Neptliumlabs'), true);
  assert.equal(footer.includes('Instagram'), false);
  assert.equal(footer.includes("label: 'X'"), false);
  assert.equal(footer.includes('Careers'), false);
});

test('production marketing consumes shared canonical brand authority', () => {
  const productionCss = read('app/marketing-production.css');
  const homeCss = read('app/marketing-home.css');
  assert.equal(productionCss.includes("@import '../../../packages/ui/src/styles/brand.css';"), true);
  assert.equal(productionCss.includes('--np-paper: var(--n-brand-canvas)'), true);
  assert.equal(productionCss.includes('--np-ink: var(--n-brand-ink)'), true);
  assert.equal(productionCss.includes('--np-blue: var(--n-brand-blue)'), true);
  assert.equal(`${productionCss}\n${homeCss}`.includes('#2764ff'), false);
  assert.equal(`${productionCss}\n${homeCss}`.includes('#147dff'), false);
  assert.equal(homeCss.includes('@media (prefers-reduced-motion: reduce)'), true);
});

test('canonical public metadata stays wired to the production domain', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(site.includes('Digital capital, organized with institutional intelligence.'), true);
  assert.equal(layout.includes("metadataBase: new URL(SITE.url)"), true);
  assert.equal(layout.includes("import './marketing-home.css';"), true);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
});
