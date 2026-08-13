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
  assert.equal(page.includes('Capital, made operational.'), true);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD']) assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
});

test('footer is corporate closure using only verified destinations', () => {
  const footer = read('components/site-footer.tsx');
  for (const label of ["label: 'Legal'", "label: 'Corporate'", "label: 'Social'", "label: 'Privacy'", "label: 'About'", "label: 'Contact'", "label: 'GitHub'"]) assert.equal(footer.includes(label), true);
  assert.equal(footer.includes('https://github.com/Neptliumlabs'), true);
  for (const forbidden of ['Instagram', "label: 'X'", 'Careers', 'Portfolio', 'Capital Account', 'Treasury', 'Allocation', 'Wallet']) assert.equal(footer.includes(forbidden), false);
});

test('production marketing uses its own dark semantic layer without mutating shared brand authority', () => {
  const productionCss = read('app/marketing-production.css');
  const homeCss = read('app/marketing-home.css');
  assert.equal(productionCss.includes("@import '../../../packages/ui/src/styles/brand.css';"), true);
  assert.equal(homeCss.includes('--marketing-black: #000000'), true);
  assert.equal(homeCss.toLowerCase().includes('--marketing-blue: #258be5'), true);
  assert.equal(homeCss.toLowerCase().includes('--marketing-blue-hover: #319eed'), true);
  assert.equal(homeCss.toLowerCase().includes('#0141f3'), false);
  assert.equal(homeCss.includes('@media (prefers-reduced-motion: reduce)'), true);
});

test('canonical public metadata stays wired to the production domain and dark browser chrome', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(site.includes('Digital capital, organized with institutional intelligence.'), true);
  assert.equal(layout.includes("metadataBase: new URL(SITE.url)"), true);
  assert.equal(layout.includes("import './marketing-home.css';"), true);
  assert.equal(layout.includes("colorScheme: 'dark light'"), true);
  assert.equal(layout.includes('data-theme="dark"'), true);
  assert.equal(layout.includes("themeColor: '#FFFFFF'"), false);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
});
