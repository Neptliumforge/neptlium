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

test('homepage implements an image-independent intelligence hero', () => {
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  for (const copy of [
    'Capital intelligence',
    'Capital,',
    'understood before',
    'it moves.',
    'position, change, and strategic attention',
  ])
    assert.match(page, new RegExp(copy, 'i'));
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(page, /className="operating-panel capital-context-map"/);
  assert.doesNotMatch(page, /ProductContextIllustration|<Image|<img|\.png|\.webp|\.jpe?g/i);
});

test('homepage establishes the six-act design hierarchy', () => {
  for (const className of [
    'editorial-hero',
    'operating-view',
    'architecture-section',
    'platform-ecosystem',
    'institutional-intelligence',
    'final-authority',
  ])
    assert.match(page, new RegExp(className));
  for (const route of ['/platform', '/products', '/solutions', '/resources', '/company'])
    assert.match(architecture, new RegExp(route));
});

test('marketing palette, structural composition and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f'])
    assert.match(css, new RegExp(value));
  assert.match(css, /\.capital-context-map/);
  assert.match(css, /\.architecture-map/);
  assert.doesNotMatch(
    css,
    /radial-gradient|linear-gradient|filter:\s*blur|backdrop-filter:\s*blur/i,
  );
  for (const media of ['68rem', '56rem', '40rem', '24.5rem'])
    assert.match(css, new RegExp(`max-width:\\s*${media.replace('.', '\\.')}`));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('navigation uses five canonical domains with accessible disclosures', () => {
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
    assert.equal(header.includes(token), true, `Missing ${token}`);
  assert.match(header, /<Link href=\{item\.href\}/);
  assert.doesNotMatch(header, />\s*Request access\s*</i);
});

test('footer mirrors institutional information architecture without unverifiable social proof', () => {
  assert.match(footer, /NAVIGATION\.map/);
  assert.match(
    footer,
    /A capital operating environment for understanding,[\s\S]*coordinating and governing what you[\s\S]*own\./,
  );
  assert.match(footer, /aria-label="Legal"/);
  assert.doesNotMatch(footer, /bsky\.app|x\.com\/Neptlium|youtube\.com|tiktok\.com/i);
});

test('homepage makes no fabricated financial claims or values', () => {
  assert.doesNotMatch(
    page,
    /\$[0-9]|\bAUM\b|customer count|partnership|licensed custodian|regulated bank/i,
  );
  assert.match(page, /Illustrative model/);
  assert.match(page, /Non-executable/);
});
