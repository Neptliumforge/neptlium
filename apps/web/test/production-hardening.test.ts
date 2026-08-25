import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public architecture defines five canonical domains and the complete product family', () => {
  const architecture = read('lib/content/public-architecture.ts');
  for (const domain of ['Platform', 'Products', 'Solutions', 'Resources', 'Company'])
    assert.equal(architecture.includes(`label: '${domain}'`), true, `Missing domain: ${domain}`);
  for (const route of [
    '/products/capital-account',
    '/products/treasury',
    '/products/allocation',
    '/products/portfolio-intelligence',
    '/products/performance',
    '/products/capital-universe',
  ])
    assert.equal(architecture.includes(`href: '${route}'`), true, `Missing canonical product route: ${route}`);
});

test('sitemap authority comes from the canonical indexable route registry without fabricated freshness', () => {
  const sitemap = read('app/sitemap.ts');
  const architecture = read('lib/content/public-architecture.ts');
  assert.equal(sitemap.includes('INDEXABLE_ROUTES'), true);
  for (const route of ['/platform', '/products', '/solutions', '/resources', '/company'])
    assert.equal(architecture.includes(`'${route}'`), true, `Missing canonical hub: ${route}`);
  for (const legacy of [
    '/capital-account',
    '/treasury',
    '/allocation',
    '/portfolio-intelligence',
    '/performance',
    '/capital-universe',
  ]) {
    const indexableBlock = architecture.slice(
      architecture.indexOf('export const INDEXABLE_ROUTES'),
      architecture.indexOf('export const ROUTE_POLICY'),
    );
    assert.equal(indexableBlock.includes(`'${legacy}'`), false, `Legacy route remains indexable: ${legacy}`);
  }
  assert.equal(sitemap.includes('lastModified: new Date()'), false);
});

test('legacy product and supporting URLs converge through permanent one-hop redirects', () => {
  const nextConfig = read('next.config.mjs');
  const redirects = [
    ['/capital-account', '/products/capital-account'],
    ['/treasury', '/products/treasury'],
    ['/allocation', '/products/allocation'],
    ['/portfolio-intelligence', '/products/portfolio-intelligence'],
    ['/performance', '/products/performance'],
    ['/capital-universe', '/products/capital-universe'],
    ['/capital-activity', '/products/capital-account'],
    ['/neptlium-link', '/platform'],
  ] as const;
  for (const [source, destination] of redirects) {
    assert.equal(nextConfig.includes(`source: '${source}'`), true, `Missing redirect source: ${source}`);
    assert.equal(nextConfig.includes(`destination: '${destination}'`), true, `Missing redirect destination: ${destination}`);
  }
  assert.equal((nextConfig.match(/permanent: true/g) ?? []).length >= redirects.length, true);
});

test('supporting surfaces stay truthful and noindex while Trust is a substantive canonical resource', () => {
  for (const path of ['app/pricing/page.tsx', 'app/research/page.tsx', 'app/press/page.tsx']) {
    const source = read(path);
    assert.equal(source.includes('index: false') || source.includes('index: false,') || source.includes('index: false'), true, `Expected noindex: ${path}`);
  }
  for (const path of [
    'app/privacy/page.tsx',
    'app/terms/page.tsx',
    'app/cookie-policy/page.tsx',
    'app/risk-disclosure/page.tsx',
  ]) {
    const source = read(path);
    assert.equal(source.includes('index: false'), true, `Expected legal noindex: ${path}`);
  }
  const trust = read('app/trust/page.tsx');
  assert.equal(trust.includes('index: false'), false);
  assert.equal(trust.includes("path: '/trust'"), true);
  assert.equal(trust.includes('certifications, insurance, regulatory approvals'), true);
});

test('five hubs have distinct jobs and substantive content', () => {
  const expectations = [
    ['app/platform/page.tsx', 'Operating lifecycle', 'Architectural principles'],
    ['app/products/page.tsx', 'Product family', 'Six products. One operating language.'],
    ['app/solutions/page.tsx', 'Operating needs', 'Start with the operating problem'],
    ['app/resources/page.tsx', 'Resource roles', 'Publishing discipline'],
    ['app/company/page.tsx', 'Operating principles', 'Company information'],
  ] as const;
  for (const [path, first, second] of expectations) {
    const source = read(path);
    assert.equal((source.match(/<h1/g) ?? []).length, 1, `${path} must have one H1`);
    assert.equal(source.includes(first), true, `Missing ${first} in ${path}`);
    assert.equal(source.includes(second), true, `Missing ${second} in ${path}`);
    assert.equal(source.includes('createPageMetadata'), true, `Missing metadata helper in ${path}`);
  }
});

test('navigation and footer consume shared architecture and preserve accessibility controls', () => {
  const header = read('components/site-header.tsx');
  const footer = read('components/site-footer.tsx');
  assert.equal(header.includes('NAVIGATION'), true);
  assert.equal(footer.includes('PRODUCTS'), true);
  assert.equal(footer.includes('SOLUTIONS'), true);
  assert.equal(footer.includes('RESOURCES'), true);
  assert.equal(footer.includes('COMPANY'), true);
  for (const contract of [
    'aria-expanded',
    'aria-controls',
    'aria-haspopup="true"',
    'aria-modal="true"',
    "event.key === 'Escape'",
    "event.key !== 'ArrowDown'",
    "document.addEventListener('pointerdown', outside)",
    "document.body.style.overflow = 'hidden'",
    'trigger.current?.focus()',
  ])
    assert.equal(header.includes(contract), true, `Missing accessibility contract: ${contract}`);
});

test('homepage carries the native proposition and routes into the five-domain model without fabricated financial values', () => {
  const page = read('app/page.tsx');
  for (const stage of [
    'Digital capital,',
    'organized',
    'around you.',
    'The operating model',
    'Products',
    'Solutions',
    'Intelligence, governance and trust',
    'Why Neptlium exists',
  ])
    assert.equal(page.includes(stage), true, `Missing homepage stage: ${stage}`);
  for (const obsoleteVisual of ['ProductContextIllustration', 'HeroArchitecture', 'CapitalArchitecture'])
    assert.equal(page.includes(obsoleteVisual), false, `Obsolete hero visual found: ${obsoleteVisual}`);
  for (const fabricatedValue of ['$128', '$42.6', '+8.42%', '+6.21%', '$—', '0 USD'])
    assert.equal(page.includes(fabricatedValue), false, `Fabricated value found: ${fabricatedValue}`);
});

test('marketing palette, medium scale and reduced motion remain explicit without decorative blur artwork', () => {
  const css = read('app/neptlium-visual-direction.css');
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.equal(css.toLowerCase().includes(token), true, `Missing palette token: ${token}`);
  assert.equal(css.includes('.hero-system'), true);
  assert.equal(css.includes('.architecture-page'), true);
  assert.equal(css.includes('.solution-essays'), true);
  assert.equal(css.includes('prefers-reduced-motion: reduce'), true);
  assert.equal(/radial-gradient|filter:\s*blur\(|backdrop-filter:\s*blur\(/i.test(css), false);
});

test('canonical public metadata stays wired to apex authority and production security headers remain enforced', () => {
  const layout = read('app/layout.tsx');
  const site = read('lib/content/site.ts');
  const robots = read('app/robots.ts');
  const seo = read('lib/seo.ts');
  const nextConfig = read('next.config.mjs');
  assert.equal(site.includes("url: 'https://neptlium.com'"), true);
  assert.equal(site.includes("publicAccessLabel: 'Enter Neptlium'"), true);
  assert.equal(layout.includes('metadataBase: new URL(SITE.url)'), true);
  assert.equal(layout.includes("themeColor: '#F5F3EE'"), true);
  assert.equal(robots.includes("sitemap: 'https://neptlium.com/sitemap.xml'"), true);
  assert.equal(robots.includes("host: 'https://neptlium.com'"), true);
  assert.equal(seo.includes('openGraph:'), true);
  assert.equal(seo.includes('twitter:'), true);
  assert.equal(seo.includes('alternates: { canonical: path }'), true);
  for (const header of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'])
    assert.equal(nextConfig.includes(header), true, `Missing security header: ${header}`);
});
