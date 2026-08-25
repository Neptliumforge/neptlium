import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');

test('homepage implements the conversational medium-scale hero', () => {
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  for (const copy of [
    'Capital operating platform',
    'Bring your capital work into one place.',
    'See portfolio context, capital movement, treasury and allocation together',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(page, /SITE\.exploreLabel/);
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /exploreLabel:\s*'Explore platforms'/);
  assert.match(page, /ProductContextIllustration/);
  assert.doesNotMatch(page, /CapitalArchitecture|\.png|\.webp|1000209629/);
});

test('marketing palette, medium type scale and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(value));
  assert.match(css, /clamp\(3\.1rem, 5vw, 4\.5rem\)/);
  assert.match(css, /border-radius:\s*0\.5rem/);
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
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|performance|partnership|licensed/i,
  );
});
