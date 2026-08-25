import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');
const architecture = read('lib/content/public-architecture.ts');

test('homepage implements an image-independent Neptlium-native hero', () => {
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  for (const copy of [
    'Capital operating platform',
    'Digital capital,',
    'organized',
    'around you.',
    'capital movement, treasury, allocation and portfolio context',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /exploreLabel:\s*'Explore platform'/);
  assert.match(page, /className="hero-system"/);
  for (const product of ['Capital Account', 'Treasury', 'Allocation', 'Portfolio Intelligence'])
    assert.match(page, new RegExp(product));
  assert.doesNotMatch(page, /ProductContextIllustration|HeroArchitecture|<Image|<img|\.png|\.webp|\.jpe?g/i);
});

test('homepage is a continuous route into the wider public system rather than the entire website', () => {
  for (const className of [
    'operating-environment',
    'capital-organization',
    'homepage-solutions',
    'intelligence-section',
    'reason-section',
    'final-authority',
  ])
    assert.match(page, new RegExp(`className="${className}`));
  for (const route of ['/platform', '/products', '/solutions', '/resources', '/company'])
    assert.match(page, new RegExp(route.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
});

test('marketing palette, structural composition and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(value));
  assert.match(css, /\.hero-system-rule/);
  assert.match(css, /\.architecture-page/);
  assert.match(css, /\.solution-essays/);
  assert.doesNotMatch(css, /radial-gradient|linear-gradient|filter:\s*blur|backdrop-filter:\s*blur/i);
  for (const media of ['68rem', '56rem', '40rem', '24.5rem'])
    assert.match(css, new RegExp(`max-width:\\s*${media.replace('.', '\\.')}`));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('navigation uses five canonical domains with direct destinations plus accessible disclosures', () => {
  for (const label of ['Platform', 'Products', 'Solutions', 'Resources', 'Company'])
    assert.match(architecture, new RegExp(`label: '${label}'`));
  for (const token of [
    'aria-expanded',
    'aria-controls',
    'aria-haspopup="true"',
    'aria-modal="true"',
    "event.key === 'Escape'",
    "document.body.style.overflow = 'hidden'",
    'trigger.current?.focus()',
  ])
    assert.match(header, new RegExp(token.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(header, /<Link href=\{item\.href\}/);
  assert.match(header, /mobile-domain-row/);
  assert.doesNotMatch(header, />\s*Request access\s*</i);
});

test('footer mirrors the public architecture and conversational closing', () => {
  assert.match(footer, /Keep your capital work connected\./);
  assert.match(footer, /SITE\.publicAccessLabel/);
  for (const label of ['Platform', 'Products', 'Solutions', 'Resources', 'Company', 'Legal'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  assert.doesNotMatch(footer, /Capital, organized with precision\./);
});

test('homepage makes no fabricated financial claims or values', () => {
  assert.doesNotMatch(
    page,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|partnership|licensed/i,
  );
  assert.match(page, /No customer balances, transactions or performance data are shown\./);
});
