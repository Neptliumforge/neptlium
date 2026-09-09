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
const publicCopy = `${page}\n${header}\n${footer}\n${architecture}`;

test('hero establishes capital intelligence and a truthful architectural model', () => {
  for (const copy of [
    'Capital intelligence',
    'Capital,',
    'understood before',
    'position, change, and strategic attention',
    'Relationships in view',
    'Illustrative model',
    'Non-executable',
  ])
    assert.match(page, new RegExp(copy, 'i'));
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /className="operating-panel capital-context-map"/);
  assert.doesNotMatch(page, /<Image|<img|\.png|\.webp|dashboard mockup/i);
});

test('homepage follows understanding, context, architecture, capability, trust and entry', () => {
  for (const copy of [
    'Capital intelligence',
    'Operating view',
    'Intelligence architecture',
    'Platform environment',
    'Institutional trust',
    'Enter the environment',
  ])
    assert.match(page, new RegExp(copy, 'i'));
  for (const domain of [
    'Ownership Intelligence',
    'Market Intelligence',
    'Decision Intelligence',
    'Capital Operations',
  ])
    assert.match(page, new RegExp(domain));
  for (const distinction of [
    'Observed evidence',
    'Modeled context',
    'Authorization before consequence',
    'Verification after movement',
  ])
    assert.match(page, new RegExp(distinction));
});

test('public CTA authority is centralized and routes visitors to explicit account entry', () => {
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /publicAccessUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-up'/);
  assert.match(site, /signInUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.equal((page.match(/SITE\.publicAccessLabel/g) ?? []).length, 2);
  assert.equal((page.match(/SITE\.publicAccessUrl/g) ?? []).length, 2);
  for (const source of [page, header]) assert.match(source, /SITE\.publicAccess/);
  assert.doesNotMatch(publicCopy, /Request access|Book a demo|Get started free/i);
});

test('navigation is exactly five canonical institutional domains', () => {
  for (const domain of ['Platform', 'Products', 'Solutions', 'Resources', 'Company'])
    assert.match(architecture, new RegExp(`label: '${domain}'`));
  assert.match(architecture, /PRIMARY_PRODUCTS = PRODUCTS\.slice\(0, 4\)/);
  assert.match(architecture, /PRIMARY_COMPANY = COMPANY\.slice\(0, 2\)/);
  assert.match(header, /NAVIGATION\.map/);
});

test('desktop and mobile navigation preserve accessible control behavior', () => {
  for (const contract of [
    'aria-expanded',
    'aria-controls',
    'aria-haspopup',
    'aria-modal="true"',
    "event.key === 'Escape'",
    "document.body.style.overflow = 'hidden'",
    'trigger.current?.focus()',
  ])
    assert.equal(header.includes(contract), true, `Missing navigation contract: ${contract}`);
  assert.match(css, /\.mobile-command-wrap[\s\S]*position:\s*fixed/);
  assert.match(css, /\.mobile-command-sheet[\s\S]*100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('footer mirrors public architecture and separates legal navigation', () => {
  assert.match(footer, /NAVIGATION\.map/);
  for (const legal of ['Privacy', 'Terms', 'Cookie Policy', 'Risk Disclosure', 'Accessibility'])
    assert.match(footer, new RegExp(legal));
  assert.match(footer, /aria-label="Legal"/);
  assert.doesNotMatch(footer, /bsky\.app|x\.com\/Neptlium|youtube\.com|tiktok\.com/i);
});

test('canonical brand and restrained palette remain authoritative', () => {
  assert.match(brand, /from '@neptlium\/ui'/);
  assert.match(brand, /NeptliumMark/);
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f'])
    assert.match(css, new RegExp(token, 'i'));
  assert.match(layout, /neptlium-visual-direction\.css/);
  for (const retired of [
    'landing-v3.css',
    'marketing-shell.css',
    'marketing-production.css',
    'unified-design.css',
  ])
    assert.doesNotMatch(layout, new RegExp(retired.replace('.', '\\.')));
  assert.doesNotMatch(
    css,
    /radial-gradient|linear-gradient|filter:\s*blur|backdrop-filter:\s*blur/i,
  );
});

test('marketing remains non-financial authority', () => {
  assert.doesNotMatch(
    publicCopy,
    /\$[0-9]|\bAUM\b|customer count|transaction volume|testimonial|licensed custodian|regulated bank/i,
  );
  assert.doesNotMatch(
    `${page}\n${header}\n${footer}`,
    /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/,
  );
});
