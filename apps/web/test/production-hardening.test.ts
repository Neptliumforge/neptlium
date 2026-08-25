import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('sitemap contains only authoritative indexable public landing pages', () => {
  const sitemap = read('app/sitemap.ts');
  for (const route of [
    '/platform',
    '/portfolio-intelligence',
    '/capital-account',
    '/allocation',
    '/treasury',
    '/learn',
    '/company',
    '/about',
    '/security',
    '/contact',
    '/accessibility',
  ]) {
    assert.equal(sitemap.includes(`'${route}'`), true, `Missing sitemap route: ${route}`);
  }
  for (const route of [
    '/capital-activity',
    '/neptlium-link',
    '/performance',
    '/capital-universe',
    '/research',
    '/trust',
    '/press',
    '/privacy',
    '/terms',
    '/cookie-policy',
    '/risk-disclosure',
    '/pricing',
  ])
    assert.equal(sitemap.includes(`'${route}'`), false, `Non-authoritative route in sitemap: ${route}`);
  assert.equal(sitemap.includes('lastModified: new Date()'), false);
});

test('supporting product routes explicitly opt out of indexing', () => {
  for (const path of [
    'app/capital-activity/page.tsx',
    'app/neptlium-link/page.tsx',
    'app/performance/page.tsx',
    'app/capital-universe/page.tsx',
    'app/research/page.tsx',
    'app/trust/page.tsx',
    'app/press/page.tsx',
  ]) {
    const source = read(path);
    assert.equal(source.includes('index: false'), true, `Expected noindex contract in ${path}`);
  }
});

test('navigation exposes only the locked public categories and preserves accessibility controls', () => {
  const header = read('components/site-header.tsx');
  for (const section of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.equal(header.includes(`label: '${section}'`), true);
  for (const removed of ['Capital', 'Connectivity', 'Governance'])
    assert.equal(header.includes(`label: '${removed}'`), false);
  assert.equal(header.includes("href: '/research'"), false);
  assert.equal(header.includes('SITE.publicAccessLabel'), true);
  assert.equal(header.includes('SITE.publicAccessUrl'), true);
  assert.equal(header.includes('SITE.exploreLabel'), true);
  assert.equal(header.includes('SITE.exploreUrl'), true);
  assert.equal(header.includes('Request access'), false);
  assert.equal(header.includes('aria-expanded={open}'), true);
  assert.equal(header.includes('aria-controls={id}'), true);
  assert.equal(header.includes('aria-haspopup="true"'), true);
  assert.equal(header.includes("event.key === 'Escape'"), true);
  assert.equal(header.includes("event.key !== 'ArrowDown'"), true);
  assert.equal(header.includes("document.addEventListener('pointerdown', outside)"), true);
});

test('homepage carries canonical capital-operating positioning through native system language', () => {
  const page = read('app/page.tsx');
  for (const stage of [
    'Capital operating platform',
    'Digital capital,',
    'organized',
    'around you.',
    'The operating environment',
    'How capital is organized',
    'Portfolio Intelligence',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Intelligence and governance',
    'Why Neptlium exists',
    'See capital as one connected system.',
  ])
    assert.equal(page.includes(stage), true, `Missing narrative stage: ${stage}`);
  assert.equal(page.includes('SITE.publicAccessLabel'), true);
  assert.equal(page.includes('SITE.exploreLabel'), true);
  assert.equal(page.includes('className="hero-system"'), true);
  for (const obsoleteVisual of ['ProductContextIllustration', 'HeroArchitecture', 'CapitalArchitecture'])
    assert.equal(page.includes(obsoleteVisual), false, `Obsolete hero visual found: ${obsoleteVisual}`);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD'])
    assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
});

test('footer is compact closure using only verified destinations', () => {
  const footer = read('components/site-footer.tsx');
  for (const label of [
    "label: 'Platform'",
    "label: 'Learn'",
    "label: 'Legal'",
    "label: 'Connect'",
    "label: 'Privacy'",
    "label: 'GitHub'",
  ]) {
    assert.equal(footer.includes(label), true, `Missing footer label: ${label}`);
  }
  assert.equal(footer.includes('Keep your capital work connected.'), true);
  assert.equal(footer.includes('SITE.publicAccessLabel'), true);
  assert.equal(footer.includes('SITE.exploreLabel'), true);
  assert.equal(footer.includes('https://github.com/Neptliumforge'), true);
  assert.equal(footer.includes('footer-closing'), false);
  for (const unverified of ['bsky.app', 'x.com/Neptlium', 'youtube.com/@neptlium', 'tiktok.com/@neptlium'])
    assert.equal(footer.includes(unverified), false, `Unverified footer destination found: ${unverified}`);
  assert.equal(footer.includes('Neptliumlabs'), false);
  assert.equal(footer.includes('rel="noopener noreferrer"'), true);
  assert.equal(footer.includes('opens in a new tab'), true);
});

test('marketing palette resolves to ivory carbon teal and structural medium-scale direction', () => {
  const css = read('app/neptlium-visual-direction.css');
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.equal(css.toLowerCase().includes(token), true, `Missing palette token: ${token}`);
  assert.equal(css.includes('clamp(3.1rem, 5vw, 4.5rem)'), true);
  assert.equal(css.includes('.hero-system'), true);
  assert.equal(css.includes('.capability-system'), true);
  assert.equal(css.includes('product-context'), false);
  assert.equal(css.includes('prefers-reduced-motion: reduce'), true);
});

test('canonical public metadata stays wired to apex production domain and warm-ivory browser chrome', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  const seo = read('lib/seo.ts');
  const icon = read('public/icon.svg');
  const og = read('app/opengraph-image.tsx');
  const apple = read('app/apple-icon.tsx');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(site.includes("positioning: 'Keep your capital work connected.'"), true);
  assert.equal(site.includes("publicAccessLabel: 'Enter Neptlium'"), true);
  assert.equal(site.includes("exploreLabel: 'Explore platforms'"), true);
  assert.equal(layout.includes('metadataBase: new URL(SITE.url)'), true);
  assert.equal(layout.includes("colorScheme: 'light'"), true);
  assert.equal(layout.includes('data-theme="light"'), true);
  assert.equal(layout.includes("themeColor: '#F5F3EE'"), true);
  assert.equal(layout.includes('https://github.com/Neptliumforge'), true);
  assert.equal(layout.includes("url: '/apple-icon'"), true);
  assert.equal(icon.includes('#0F8F86'), true);
  assert.equal(og.includes('#F5F3EE'), true);
  assert.equal(og.includes('#0F8F86'), true);
  assert.equal(apple.includes('#F5F3EE'), true);
  assert.equal(apple.includes('#0F8F86'), true);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
  assert.equal(robots.includes("host: 'https://neptlium.com'"), true);
  assert.equal(seo.includes('openGraph:'), true);
  assert.equal(seo.includes('twitter:'), true);
  assert.equal(seo.includes('alternates: { canonical: path }'), true);
});

test('production security headers remain enforced outside deployment-specific config', () => {
  const nextConfig = read('next.config.mjs');
  for (const header of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'])
    assert.equal(nextConfig.includes(header), true, `Missing security header: ${header}`);
});