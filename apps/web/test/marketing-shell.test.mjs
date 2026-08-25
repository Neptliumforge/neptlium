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

test('hero preserves canonical capital-operating proposition and exactly one H1', () => {
  for (const copy of [
    'Capital operating infrastructure',
    'A capital operating',
    'platform for modern',
    'investment organizations.',
    'portfolio context, capital operations, treasury and governed allocation',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /CapitalArchitecture/);
  assert.doesNotMatch(page, /\.png|\.webp|1000209629/);
});

test('homepage carries the institutional operating narrative', () => {
  for (const copy of [
    'One operating environment for fragmented capital work.',
    'Portfolio',
    'Capital Account',
    'Treasury',
    'Allocation',
    'Institutional controls',
    'Capital context, put into operation.',
    'Investment firms',
    'Family offices',
    'Treasury teams',
  ])
    assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  for (const obsolete of ['Provider Evidence', 'Canonical Ledger', 'Provisioning', 'Testnet'])
    assert.doesNotMatch(page, new RegExp(obsolete, 'i'));
});

test('public CTAs stay within the certified marketing surface', () => {
  assert.match(page, /Explore the platform/);
  assert.match(header, />\s*Contact\s*</);
  assert.match(site, /publicAccessLabel:\s*'Request access'/);
  assert.match(site, /publicAccessUrl:\s*'\/contact'/);
  assert.doesNotMatch(`${page}\n${header}\n${footer}`, /Open Neptlium|Sign in/);
  assert.match(header, /SITE\.publicAccessUrl/);
  assert.match(footer, /SITE\.publicAccessUrl/);
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

test('footer closes the shell with six groups and verified destinations', () => {
  for (const label of ['Platform', 'Solutions', 'Resources', 'Company', 'Legal', 'Connect'])
    assert.match(footer, new RegExp(`label: '${label}'`));
  assert.match(footer, /https:\/\/github\.com\/Neptliumforge/);
  for (const unverified of ['bsky.app', 'x.com/Neptlium', 'youtube.com/@neptlium', 'tiktok.com/@neptlium'])
    assert.doesNotMatch(footer, new RegExp(unverified.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.doesNotMatch(footer, /Neptliumlabs/i);
  assert.doesNotMatch(footer, /href=["']#["']/);
  assert.doesNotMatch(footer, /Product availability is established|authenticated operating environment/i);
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
