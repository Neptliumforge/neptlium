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

test('homepage states the investor proposition without fabricated financial proof', () => {
  assert.match(page, /Capital, made clearer\./);
  assert.match(page, /portfolio visibility, capital management, funding workflows, reporting and governed financial activity/i);
  assert.match(page, /Explore the Platform/);
  assert.match(page, /View Investment Solutions/);
  assert.match(page, /No fabricated balances, performance or transaction states/i);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|guaranteed returns?|customer count|testimonial/i);
});

test('homepage covers institutional trust, investment discipline, funding truth and reporting', () => {
  for (const copy of [
    'Institutional trust',
    'Investment experience',
    'Portfolio intelligence',
    'Funding infrastructure',
    'Investment solutions',
    'Security & financial integrity',
    'How Neptlium works',
    'Investor reporting',
    'Insights',
  ]) assert.match(page, new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.match(page, /USD funding is not represented on this website as a currently available public capability/i);
  assert.match(page, /DISCLOSURES\.investment/);
});

test('public conversion separates acquisition, return sign-in and exploration', () => {
  assert.match(site, /publicAccessLabel:\s*'Get Started'/);
  assert.match(site, /signInUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.match(site, /signUpUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-up'/);
  assert.match(header, /href=\{SITE\.signInUrl\}>Sign In/);
  assert.match(header, /href=\{SITE\.signUpUrl\}>Get Started/);
  assert.match(page, /href="\/platform">Explore the Platform/);
  assert.match(page, /href="\/investments">View Investment Solutions/);
});

test('navigation is the five-domain investor marketing architecture', () => {
  for (const domain of ['Platform', 'Investments', 'Insights', 'Security', 'Company'])
    assert.match(architecture, new RegExp(`label: '${domain}'`));
  for (const contract of ['aria-expanded', 'aria-controls', 'aria-haspopup', "event.key === 'Escape'", 'trigger.current?.focus()'])
    assert.match(header, new RegExp(contract.replace(/[.*+?^$()|[\]\\]/g, '\\$&')));
});

test('footer exposes real account, platform, company and legal destinations', () => {
  for (const label of ['Overview', 'Investments', 'Funding', 'Security', 'About', 'Insights', 'Contact', 'Sign In', 'Create Account'])
    assert.match(footer, new RegExp(label));
  for (const legal of ['Privacy', 'Terms', 'Risk Disclosure', 'Cookie Policy', 'Accessibility'])
    assert.match(footer, new RegExp(legal));
  assert.match(footer, /does not constitute investment advice/i);
  assert.match(footer, /rel="noopener noreferrer"/);
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
