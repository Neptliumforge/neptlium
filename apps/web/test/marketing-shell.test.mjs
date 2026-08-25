import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/brand.tsx');
const sitemap = read('app/sitemap.ts');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');
const shell = `${page}\n${layout}\n${header}\n${footer}\n${brand}\n${css}\n${site}`;

test('hero preserves capital-operating meaning with conversational copy and exactly one H1', () => {
  for (const copy of [
    'Capital operating platform',
    'Bring your capital work into one place.',
    'portfolio context, capital movement, treasury and allocation',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /ProductContextIllustration/);
  assert.doesNotMatch(page, /CapitalArchitecture|\.png|\.webp|1000209629/);
});

test('homepage carries the connected capital narrative', () => {
  for (const copy of [
    'Keep the work connected.',
    'Portfolio',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Move with the right controls.',
    'Keep your capital work connected.',
    'Investment firms',
    'Family offices',
    'Treasury teams',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  for (const obsolete of ['Provider Evidence', 'Canonical Ledger', 'Provisioning', 'Testnet'])
    assert.doesNotMatch(page, new RegExp(obsolete, 'i'));
});

test('public CTAs use the canonical product-entry pair', () => {
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /publicAccessUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.match(site, /exploreLabel:\s*'Explore platforms'/);
  assert.match(site, /exploreUrl:\s*'\/platform'/);
  for (const source of [page, header, footer]) {
    assert.match(source, /SITE\.publicAccess/);
    assert.match(source, /SITE\.explore/);
  }
  assert.doesNotMatch(`${page}\n${header}\n${footer}`, /Request access|Open Neptlium/);
});

test('navigation is exactly the four canonical groups with real routes', () => {
  for (const section of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.match(header, new RegExp(`label: '${section}'`));
  const routes = [...header.matchAll(/href: '([^']+)'/g)].map((match) => match[1]);
  assert.ok(routes.length > 0);
  for (const route of routes) {
    assert.ok(route.startsWith('/'));
    assert.match(sitemap, new RegExp(`'${route.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}'`));
  }
});

test('navigation preserves desktop and mobile accessibility', () => {
  for (const contract of [
    'aria-expanded',
    'aria-controls',
    'aria-haspopup',
    'aria-modal="true"',
    "event.key === 'Escape'",
    "event.key !== 'ArrowDown'",
    "document.body.style.overflow = 'hidden'",
    'trigger.current?.focus()',
    'relatedTarget',
  ])
    assert.match(header, new RegExp(contract.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
});

test('footer is compact closure with verified destinations', () => {
  for (const label of ['Platform', 'Learn', 'Legal', 'Connect'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  assert.match(footer, /https:\/\/github\.com\/Neptliumforge/);
  assert.match(footer, /Keep your capital work connected\./);
  assert.doesNotMatch(footer, /Capital, organized with precision\.|footer-closing/);
  for (const unverified of ['bsky.app', 'x.com/Neptlium', 'youtube.com/@neptlium', 'tiktok.com/@neptlium'])
    assert.doesNotMatch(footer, new RegExp(unverified.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.doesNotMatch(footer, /Neptliumlabs/i);
  assert.doesNotMatch(footer, /href=["']#["']/);
});

test('canonical brand and palette remain authoritative', () => {
  assert.match(brand, /from '@neptlium\/ui'/);
  assert.match(brand, /NeptliumMark/);
  assert.doesNotMatch(brand, /<svg|<path|d="/);
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(token, 'i'));
  assert.match(layout, /neptlium-visual-direction\.css/);
});

test('marketing remains non-financial authority', () => {
  const marketingCopy = `${page}\n${header}\n${footer}`;
  assert.doesNotMatch(
    marketingCopy,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner/i,
  );
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
});
