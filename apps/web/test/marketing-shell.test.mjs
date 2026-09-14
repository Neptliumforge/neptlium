import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/brand.tsx');
const site = read('lib/content/site.ts');
const architecture = read('lib/content/public-architecture.ts');

test('homepage states the canonical capital proposition without fabricated financial proof', () => {
  assert.match(page, /Capital, clearly\./);
  assert.match(page, /understand, coordinate and move through your financial world with context intact/i);
  assert.match(page, /Explore Neptlium/);
  assert.match(page, /For business/);
  assert.match(page, /Illustrative interface only\. No customer balances, returns or performance data are shown\./i);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|customer count|testimonial/i);
});

test('homepage exposes the four canonical product families and contextual intelligence', () => {
  for (const family of ['Capital', 'Treasury', 'Institutional', 'Infrastructure']) {
    assert.match(page, new RegExp(`label: '${family}'`));
    assert.match(page, new RegExp(`Explore ${family}`));
  }
  assert.match(page, /Explore Insights/);
  assert.match(page, /DISCLOSURES\.general/);
});

test('public conversion separates personal and business account contexts', () => {
  assert.match(site, /personalSignInUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.match(site, /personalSignUpUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-up'/);
  assert.match(header, /SITE\.personalSignInUrl/);
  assert.match(header, /SITE\.personalSignUpUrl/);
  assert.match(header, /SITE\.businessAppUrl/);
  assert.match(header, /Neptlium Capital/);
  assert.match(header, /Neptlium Treasury/);
});

test('navigation exposes product families plus insights and company', () => {
  for (const domain of ['Capital', 'Treasury', 'Institutional', 'Infrastructure', 'Insights', 'Company'])
    assert.match(architecture, new RegExp(`label: '${domain}'`));
  assert.match(header, /NAVIGATION\.map/);
  assert.match(header, /aria-label="Primary navigation"/);
});

test('footer is intentionally minimal and exposes trust, social and real status destinations', () => {
  assert.match(footer, /Capital systems for people, businesses and institutions\./);
  for (const social of ['X', 'Bluesky', 'YouTube']) assert.match(footer, new RegExp(`label: '${social}'`));
  for (const legal of ['Security', 'Privacy', 'Terms', 'Risk disclosure', 'Accessibility', 'Cookies'])
    assert.match(footer, new RegExp(`label: '${legal}'`));
  assert.match(footer, /SITE\.statusUrl/);
  assert.match(footer, /View system status/);
  assert.doesNotMatch(footer, /All systems operational/i);
  assert.doesNotMatch(footer, /Overview|Create Account|Investment Solutions/);
});

test('canonical brand remains repository-authoritative', () => {
  assert.match(brand, /from '@neptlium\/ui'/);
  assert.match(brand, /NeptliumMark/);
  assert.doesNotMatch(brand, /<svg|<path|d="/);
});

test('marketing contains no privileged financial authority', () => {
  const marketing = `${page}\n${header}\n${footer}\n${architecture}`;
  assert.doesNotMatch(marketing, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner/i);
  assert.doesNotMatch(marketing, /guaranteed (?:return|profit|income)/i);
  assert.doesNotMatch(marketing, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|STRIPE_SECRET_KEY|CIRCLE_API_KEY/);
});
