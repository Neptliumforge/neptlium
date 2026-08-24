import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');

test('homepage implements the canonical editorial hero', () => {
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  for (const copy of [
    'Institutional capital operating infrastructure',
    'A capital operating',
    'platform for modern',
    'investment organizations.',
    'Explore platform',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.match(page, /SITE\.publicAccessLabel/);
  assert.match(site, /publicAccessLabel:\s*'Request access'/);
  assert.match(page, /CapitalArchitecture/);
  assert.doesNotMatch(page, /\.png|\.webp|1000209629/);
});

test('marketing palette and responsive contracts are explicit', () => {
  for (const value of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(value));
  assert.doesNotMatch(css, /#c88b28/i);
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
  assert.match(header, />\s*Contact\s*</);
  assert.match(header, /SITE\.publicAccessLabel/);
  assert.match(header, /SITE\.publicAccessUrl/);
  assert.doesNotMatch(header, />\s*Sign in\s*</);
  assert.doesNotMatch(header, />\s*Open Neptlium\s*</);
});

test('homepage makes no fabricated financial claims or values', () => {
  assert.doesNotMatch(
    page,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|performance|partnership|licensed/i,
  );
});
