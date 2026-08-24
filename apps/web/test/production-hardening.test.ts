import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains the indexable public product surface and excludes noindex legal drafts', () => {
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
    '/accessibility',
  ]) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }
  for (const route of ['/privacy', '/terms', '/cookie-policy', '/risk-disclosure', '/pricing'])
    assert.equal(sitemap.includes(`'${route}'`), false, `Non-indexable route in sitemap: ${route}`);
  assert.equal(sitemap.includes('lastModified: new Date()'), false);
});

test('navigation exposes only the locked public categories and preserves accessibility controls', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.equal(header.includes(`label: '${section}'`), true);
  for (const removed of ['Capital', 'Connectivity', 'Governance'])
    assert.equal(header.includes(`label: '${removed}'`), false);
  assert.equal(header.includes('Operating progression'), false);
  assert.equal(header.includes('Capability follows verified architecture'), false);
  assert.equal(header.includes('Request access'), false);
  assert.equal(header.includes('SITE.publicAccessLabel'), true);
  assert.equal(header.includes('SITE.publicAccessUrl'), true);
  assert.equal(header.includes('Open Neptlium'), false);
  assert.equal(header.includes('Sign in'), false);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', outside)"), true);
});

test('homepage carries canonical capital-operating positioning through a truthful narrative', () => {
  const page = read('app/page.tsx');
  assert.equal(page.includes('A capital operating'), true);
  assert.equal(page.includes('Institutional capital operating infrastructure'), true);
  assert.equal(page.includes('Explore platform'), true);
  assert.equal(page.includes('SITE.publicAccessLabel'), true);
  assert.equal(page.includes('SITE.publicAccessUrl'), true);
  assert.equal(page.includes('Open Neptlium'), false);
  assert.equal(page.includes('CapitalArchitecture'), true);
  for (const stage of [
    'One operating environment for fragmented capital work.',
    'Portfolio',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Institutional controls',
  ])
    assert.equal(page.includes(stage), true, `Missing narrative stage: ${stage}`);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD'])
    assert.equal(
      page.includes(fabricatedValue),
      false,
      `Fabricated value found: ${fabricatedValue}`,
    );
});

test('footer is institutional closure using only canonical destinations', () => {
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
    'https://github.com/Neptliumforge',
  ]) {
    assert.equal(
      footer.includes(destination),
      true,
      `Missing canonical destination: ${destination}`,
    );
  }

  assert.equal(footer.includes('Neptliumlabs'), false);
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

test('canonical public metadata stays wired to apex production domain and warm-ivory browser chrome', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(
    site.includes('A capital operating platform for modern investment organizations.'),
    true,
  );
  assert.equal(layout.includes('metadataBase: new URL(SITE.url)'), true);
  assert.equal(layout.includes("import './unified-design.css';"), true);
  assert.equal(layout.includes("colorScheme: 'light'"), true);
  assert.equal(layout.includes('data-theme="light"'), true);
  assert.equal(layout.includes("themeColor: '#F5F3EE'"), true);
  assert.equal(layout.includes('https://github.com/Neptliumforge'), true);
  assert.equal(layout.includes('Neptliumlabs'), false);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
  assert.equal(robots.includes("host: 'https://neptlium.com'"), true);
});
