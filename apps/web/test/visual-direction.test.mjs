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
    'Capital intelligence',
    'Capital,',
    'understood before',
    'it moves.',
    'understanding position, change, and strategic attention',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(page, /href=\{SITE\.publicAccessUrl\}/);
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /exploreLabel:\s*'Explore platform'/);
  assert.match(page, /className="authority-hero editorial-hero"/);
  assert.match(page, /className="operating-panel capital-context-map"/);
  for (const product of ['Capital Account', 'Treasury', 'Allocation', 'Portfolio Intelligence'])
    assert.match(page, new RegExp(product));
  assert.doesNotMatch(page, /ProductContextIllustration|HeroArchitecture|<Image|<img|\.png|\.webp|\.jpe?g/i);
});

test('homepage presents a continuous institutional capital-intelligence narrative', () => {
  for (const className of [
    'context-statement',
    'intelligence-pillars architecture-section',
    'product-experience platform-ecosystem',
    'ecosystem-map',
    'institutional-intelligence',
    'solutions-section',
    'ai-section',
  ])
    assert.match(page, new RegExp(`className="${className}`));
  for (const surface of ['Portfolio Intelligence', 'Capital Account', 'Treasury', 'Allocation Intelligence'])
    assert.match(page, new RegExp(surface));
});

test('marketing palette, structural composition and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(value));
  assert.match(css, /\.authority-hero/);
  assert.match(css, /\.architecture-section/);
  assert.match(css, /\.solutions-section/);
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

test('footer preserves institutional identity, public channels and legal access', () => {
  assert.match(footer, /A capital operating environment for understanding, coordinating and governing what you own\./);
  for (const label of ['Bluesky', 'X', 'YouTube', 'TikTok'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  for (const label of ['Privacy', 'Terms', 'Cookie Policy', 'Risk Disclosure', 'Accessibility'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  assert.match(footer, /rel="noopener noreferrer"/);
});

test('homepage makes no fabricated financial claims or values', () => {
  assert.doesNotMatch(
    page,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|partnership|licensed/i,
  );
  assert.doesNotMatch(
    page,
    /guaranteed returns?|projected returns?|portfolio performance|gain\/loss|net worth/i,
  );
});
