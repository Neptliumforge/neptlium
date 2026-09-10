import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/brand.tsx');
const css = read('app/neptlium-visual-direction.css');
const site = read('lib/content/site.ts');
const architecture = read('lib/content/public-architecture.ts');

test('hero establishes a concise capital-operating proposition and governed entry', () => {
  assert.match(page, /Capital should remain<br \/>intelligible as it moves\./);
  assert.match(page, /Capital operating infrastructure/);
  assert.match(page, /capital state, operating context, and governed work/i);
  assert.match(page, /className="operating-panel capital-context-map"/);
  assert.match(page, /href=\{SITE\.publicAccessUrl\}>Enter Neptlium/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(page, /<Image|<img|\.png|\.webp|dashboard mockup/i);
});

test('homepage connects the operating architecture without fabricated proof', () => {
  for (const copy of [
    'Clarity before consequence',
    'Capital state.',
    'Operating context.',
    'Governed work.',
    'The operating system for capital.',
    'The system should never claim more than the evidence supports.',
  ]) assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  for (const product of ['Portfolio Intelligence', 'Capital Account', 'Treasury', 'Allocation'])
    assert.match(page, new RegExp(product));
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?/i);
});

test('public CTA authority preserves distinct entry and authentication destinations', () => {
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /publicAccessUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-up'/);
  assert.match(site, /signInUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.match(header, /href=\{SITE\.publicAccessUrl\}/);
  assert.doesNotMatch(`${page}\n${header}\n${footer}`, /Request access|Book a demo|Get started free/i);
});

test('navigation remains five canonical accessible domains', () => {
  for (const domain of ['Platform', 'Products', 'Solutions', 'Resources', 'Company'])
    assert.match(architecture, new RegExp(`label: '${domain}'`));
  for (const contract of ['aria-expanded', 'aria-controls', 'aria-haspopup', 'aria-modal="true"', "event.key === 'Escape'", 'trigger.current?.focus()'])
    assert.match(header, new RegExp(contract.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
});

test('footer separates verified public channels from legal navigation', () => {
  for (const social of ['Bluesky', 'X', 'YouTube', 'TikTok']) assert.match(footer, new RegExp(`label: '${social}'`));
  for (const legal of ['Privacy', 'Terms', 'Cookie Policy', 'Risk Disclosure', 'Accessibility']) assert.match(footer, new RegExp(`label: '${legal}'`));
  assert.match(footer, /aria-label="Legal"/);
  assert.match(footer, /rel="noopener noreferrer"/);
});

test('canonical brand and restrained visual authority remain intact', () => {
  assert.match(brand, /from '@neptlium\/ui'/);
  assert.match(brand, /NeptliumMark/);
  assert.doesNotMatch(brand, /<svg|<path|d="/);
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5'])
    assert.match(css, new RegExp(token, 'i'));
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.doesNotMatch(css, /radial-gradient|backdrop-filter:\s*blur\(|filter:\s*blur\(/i);
});

test('marketing contains no privileged financial authority', () => {
  const marketing = `${page}\n${header}\n${footer}\n${architecture}`;
  assert.doesNotMatch(marketing, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner/i);
  assert.doesNotMatch(marketing, /guaranteed|settlement authority/i);
  assert.doesNotMatch(`${marketing}\n${layout}`, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
});
