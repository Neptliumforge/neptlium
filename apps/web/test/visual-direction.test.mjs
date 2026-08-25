import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');

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
  assert.match(page, /SITE\.exploreLabel/);
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /exploreLabel:\s*'Explore platforms'/);
  assert.match(page, /className="hero-system"/);
  assert.match(page, /Capital Account/);
  assert.match(page, /Treasury/);
  assert.match(page, /Allocation/);
  assert.match(page, /Portfolio Intelligence/);
  assert.doesNotMatch(page, /ProductContextIllustration|HeroArchitecture|<Image|<img|\.png|\.webp|\.jpe?g/i);
});

test('homepage is a continuous operating narrative rather than disconnected marketing art', () => {
  for (const className of [
    'operating-environment',
    'capital-organization',
    'intelligence-section',
    'reason-section',
    'final-authority',
  ])
    assert.match(page, new RegExp(`className="${className}`));

  for (const copy of [
    'The operating environment',
    'How capital is organized',
    'Intelligence and governance',
    'Why Neptlium exists',
  ])
    assert.match(page, new RegExp(copy));
});

test('marketing palette, structural hero and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(value));
  assert.match(css, /clamp\(3\.1rem, 5vw, 4\.5rem\)/);
  assert.match(css, /\.hero-system-rule/);
  assert.match(css, /\.capability-system/);
  assert.doesNotMatch(css, /radial-gradient|linear-gradient|filter:\s*blur/i);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('navigation uses four canonical groups and accessible disclosures', () => {
  for (const label of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.match(header, new RegExp(`label: '${label}'`));
  for (const token of [
    'aria-expanded',
    'aria-controls',
    'aria-modal="true"',
    "event.key === 'Escape'",
    "document.body.style.overflow = 'hidden'",
    'trigger.current?.focus()',
  ])
    assert.match(header, new RegExp(token.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(header, /SITE\.publicAccessLabel/);
  assert.match(header, /SITE\.exploreLabel/);
  assert.match(header, /SITE\.publicAccessUrl/);
  assert.match(header, /SITE\.exploreUrl/);
  assert.doesNotMatch(header, />\s*Request access\s*</i);
});

test('footer carries the canonical CTA pair and conversational closing', () => {
  assert.match(footer, /Keep your capital work connected\./);
  assert.match(footer, /SITE\.publicAccessLabel/);
  assert.match(footer, /SITE\.exploreLabel/);
  assert.doesNotMatch(footer, /Capital, organized with precision\./);
});

test('homepage makes no fabricated financial claims or values', () => {
  assert.doesNotMatch(
    page,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|partnership|licensed/i,
  );
  assert.match(page, /No customer balances, transactions or performance data are shown\./);
});
