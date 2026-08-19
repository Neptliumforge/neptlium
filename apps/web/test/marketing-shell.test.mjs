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
const shell = `${page}\n${layout}\n${header}\n${footer}\n${brand}\n${css}`;

test('hero preserves canonical proposition and exactly one H1', () => {
  assert.match(page, /Digital capital operating infrastructure/i);
  for (const copy of [
    'Digital capital,',
    'organized',
    'around you.',
    'A capital operating environment for visibility, treasury context, and governed allocation.',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /CapitalArchitecture/);
  assert.doesNotMatch(page, /\.png|\.webp|1000209629/);
});

test('homepage carries the simplified institutional narrative', () => {
  for (const copy of [
    'One operating environment',
    'Portfolio visibility',
    'Capital Account',
    'Treasury',
    'Allocation',
    'capital movement',
    'Institutional control',
    'Put capital context into operation.',
  ])
    assert.match(page, new RegExp(copy, 'i'));
  for (const obsolete of [
    'Provider Evidence',
    'Canonical Ledger',
    'Reconciliation',
    'Provisioning',
    'Testnet',
  ])
    assert.doesNotMatch(page, new RegExp(obsolete, 'i'));
});

test('canonical CTAs are used across public entry points', () => {
  for (const label of ['Explore platform', 'Open Neptlium', 'Talk to Neptlium', 'Sign in'])
    assert.match(shell, new RegExp(label));
  assert.doesNotMatch(shell, /Enter Neptlium/);
});

test('navigation is exactly the four canonical groups with real routes', () => {
  for (const section of ['Platform', 'Solutions', 'Resources', 'Company'])
    assert.match(header, new RegExp(`label: '${section}'`));
  for (const obsolete of ['Operating progression', 'Capability follows verified architecture'])
    assert.doesNotMatch(header, new RegExp(obsolete));
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

test('footer closes the shell with six groups and approved destinations', () => {
  for (const label of ['Platform', 'Solutions', 'Resources', 'Company', 'Legal', 'Connect'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  for (const destination of [
    'https://bsky.app/profile/neptlium.bsky.social',
    'https://x.com/Neptlium',
    'https://youtube.com/@neptlium',
    'https://www.tiktok.com/@neptlium',
    'https://github.com/Neptliumlabs',
  ])
    assert.match(footer, new RegExp(destination.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
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
  assert.doesNotMatch(
    shell,
    /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/,
  );
});
