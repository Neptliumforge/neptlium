import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains the complete indexable public product surface', () => {
  const sitemap = read('app/sitemap.ts');
  for (const route of [
    '/platform',
    '/portfolio-intelligence',
    '/capital-account',
    '/capital-activity',
    '/neptlium-link',
    '/allocation',
    '/treasury',
    '/capital-universe',
    '/research',
    '/learn',
    '/company',
    '/about',
    '/security',
    '/trust',
    '/contact',
  ]) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }
  assert.equal(sitemap.includes("'/pricing'"), false);
});

test('navigation exposes only the locked public categories and preserves accessibility controls', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.equal(header.includes(`label: '${section}'`), true);
  for (const removed of ['Capital', 'Connectivity', 'Governance'])
    assert.equal(header.includes(`label: '${removed}'`), false);
  assert.equal(header.includes('Operating progression'), false);
  assert.equal(header.includes('Capability follows verified architecture'), false);
  assert.equal(header.includes('Sign in'), true);
  assert.equal(header.includes('Open Neptlium'), true);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', outside)"), true);
});

test('homepage carries canonical positioning through the simplified truthful narrative', () => {
  const page = read('app/page.tsx');
  assert.equal(page.includes('Digital capital,'), true);
  assert.equal(page.includes('Digital capital operating infrastructure'), true);
  assert.equal(page.includes('Explore platform'), true);
  assert.equal(page.includes('Open Neptlium'), true);
  assert.equal(page.includes('Talk to Neptlium'), true);
  assert.equal(page.includes('CapitalArchitecture'), true);
  for (const stage of [
    'One operating environment',
    'Portfolio visibility',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Institutional control',
  ])
    assert.equal(page.includes(stage), true, `Missing narrative stage: ${stage}`);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD'])
    assert.equal(
      page.includes(fabricatedValue),
      false,
      `Fabricated value found: ${fabricatedValue}`,
    );
});

test('footer is institutional closure using only approved destinations', () => {
  const footer = read('components/site-footer.tsx');

  for (const label of [
    "label: 'Platform'",
    "label: 'Solutions'",
    "label: 'Resources'",
    "label: 'Company'",
    "label: 'Legal'",
    "label: 'Connect'",
    "label: 'Privacy'",
    "label: 'Contact'",
    "label: 'Bluesky'",
    "label: 'X'",
    "label: 'YouTube'",
    "label: 'TikTok'",
    "label: 'GitHub'",
  ]) {
    assert.equal(footer.includes(label), true, `Missing footer label: ${label}`);
  }

  for (const destination of [
    'https://bsky.app/profile/neptlium.bsky.social',
    'https://x.com/Neptlium',
    'https://youtube.com/@neptlium',
    'https://www.tiktok.com/@neptlium',
    'https://github.com/Neptliumlabs',
  ]) {
    assert.equal(
      footer.includes(destination),
      true,
      `Missing approved destination: ${destination}`,
    );
  }

  for (const forbidden of [
    'Instagram',
    'LinkedIn',
    'Threads',
    'Facebook',
    'Discord',
    'Telegram',
    'href="#"',
  ]) {
    assert.equal(
      footer.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `Unapproved or placeholder footer destination found: ${forbidden}`,
    );
  }

  assert.equal(footer.includes('rel="noopener noreferrer"'), true);
  assert.equal(footer.includes('opens in a new tab'), true);
});

test('production marketing resolves through shared brand authority and the unified design layer', () => {
  const productionCss = read('app/marketing-production.css');
  const unifiedCss = read('app/unified-design.css');
  assert.equal(
    productionCss.includes("@import '../../../packages/ui/src/styles/brand.css';"),
    true,
  );
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
  assert.equal(layout.includes('metadataBase: new URL(SITE.url)'), true);
  assert.equal(layout.includes("import './unified-design.css';"), true);
  assert.equal(layout.includes("colorScheme: 'light'"), true);
  assert.equal(layout.includes('data-theme="light"'), true);
  assert.equal(layout.includes("themeColor: '#FFFFFF'"), true);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
});
