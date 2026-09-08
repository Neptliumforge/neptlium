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
const shell = `${page}\n${layout}\n${header}\n${footer}\n${brand}\n${css}\n${site}`;

const escaped = (copy) => new RegExp(copy.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i');

test('hero establishes category, proposition, meaning and action before the operating diagram', () => {
  for (const copy of [
    'Capital operating infrastructure',
    'The operating system for capital.',
    'See capital clearly. Coordinate what comes next. Govern how it moves.',
    'Neptlium brings portfolio context, treasury, allocation and capital movement into one operating environment.',
    'Portfolio context',
    'Treasury',
    'Allocation',
    'Governance',
  ]) assert.match(page, escaped(copy));
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.match(page, /className="hero-wave-field"/);
  assert.match(page, /href="#operating-context"/);
  assert.doesNotMatch(page, /ProductContextIllustration|<Image|<img|\.png|\.webp|1000209629/i);
  assert.match(css, /\.authority-hero h1[\s\S]*font-size:\s*clamp\(3rem, 5\.1vw, 4\.45rem\)/);
});

test('homepage expresses the full institutional landing architecture without fabricated proof', () => {
  for (const copy of [
    'One operating context',
    'Capital should remain intelligible as it moves.',
    'Distinct products. One operating language.',
    'One capital context.',
    'Where fragmented capital becomes an operating problem.',
    'Not every number means the same thing.',
    'Clarity before consequence.',
    'Built around explicit boundaries.',
    'Capital infrastructure should preserve context, not create more fragmentation.',
    'Thinking about capital as a system.',
    'See capital as one connected system.',
  ]) assert.match(page, escaped(copy));
  for (const product of ['Capital Account', 'Treasury', 'Allocation', 'Portfolio Intelligence']) assert.match(page, escaped(product));
  for (const state of ['Observed', 'Provider-reported', 'Derived', 'Modeled', 'Authorized', 'Completed']) assert.match(page, escaped(state));
  for (const boundary of ['MODELED ≠ EXECUTED', 'PENDING ≠ COMPLETED', 'VISIBLE ≠ AUTHORITATIVE', 'PUBLIC CLIENT ≠ PRIVILEGED AUTHORITY']) assert.match(page, escaped(boundary));
  for (const route of ['/platform', '/products', '/solutions', '/resources', '/about', '/security', '/trust']) assert.match(page, escaped(route));
  for (const obsolete of ['Provider Evidence', 'Canonical Ledger', 'Provisioning', 'Testnet']) assert.doesNotMatch(page, new RegExp(obsolete, 'i'));
});

test('public CTA authority keeps Enter Neptlium primary and platform discovery secondary', () => {
  assert.match(site, /publicAccessLabel:\s*'Enter Neptlium'/);
  assert.match(site, /appOrigin:\s*'https:\/\/app\.neptlium\.com'/);
  assert.match(site, /publicAccessUrl:\s*'https:\/\/app\.neptlium\.com\/'/);
  assert.match(site, /signInUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-in'/);
  assert.match(site, /signUpUrl:\s*'https:\/\/app\.neptlium\.com\/auth\/sign-up'/);
  for (const source of [page, header]) assert.match(source, /SITE\.publicAccess/);
  assert.equal((page.match(/SITE\.publicAccessLabel/g) ?? []).length, 2);
  assert.match(page, /web-button secondary[\s\S]*SITE\.publicAccessUrl/);
  assert.match(page, /text-arrow-link on-dark[\s\S]*Explore the platform/);
  assert.doesNotMatch(header, /<Link href="\/products">Products<\/Link>/);
  assert.match(header, /mobile-explore-action[\s\S]*href="\/platform"/);
  assert.match(header, /mobile-enter-action[\s\S]*SITE\.publicAccessUrl/);
  assert.doesNotMatch(`${page}\n${header}\n${footer}`, /Request access|Open Neptlium|Book a demo|Get started free/i);
});

test('navigation is exactly five canonical domains with contracted expert discovery', () => {
  const domains = ['Platform', 'Products', 'Solutions', 'Resources', 'Company'];
  for (const domain of domains) assert.match(architecture, new RegExp(`label: '${domain}'`));
  for (const route of ['/platform', '/products', '/solutions', '/resources', '/company']) assert.match(architecture, new RegExp(`href: '${route.replace('/', '\\/')}'`));
  assert.match(architecture, /PRIMARY_PRODUCTS = PRODUCTS\.slice\(0, 4\)/);
  assert.match(architecture, /PRIMARY_COMPANY = COMPANY\.slice\(0, 2\)/);
  assert.match(header, /NAVIGATION\.map/);
  assert.match(header, /href=\{item\.href\}/);
  assert.doesNotMatch(architecture, /label: 'Capital'|label: 'Connectivity'/);
});

test('navigation preserves desktop and independently designed mobile accessibility', () => {
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
    'mobile-domain-row',
    'mobile-domain-children',
    "data-home={isHome ? 'true' : 'false'}",
  ]) assert.match(header, escaped(contract));
  assert.match(css, /\.mobile-command-wrap[\s\S]*position:\s*fixed[\s\S]*inset:\s*0/);
  assert.match(css, /\.mobile-command-sheet[\s\S]*100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('footer is the complete institutional map with legal separated from product navigation', () => {
  for (const label of ['Platform', 'Products', 'Solutions', 'Resources', 'Company']) assert.match(footer, new RegExp(`label: '${label}'`));
  for (const legal of ['Privacy', 'Terms', 'Cookie Policy', 'Risk Disclosure', 'Accessibility']) assert.match(footer, new RegExp(`label: '${legal}'`));
  assert.match(footer, /aria-label="Legal"/);
  assert.match(footer, /https:\/\/github\.com\/Neptliumforge/);
  assert.match(footer, /Keep your capital work connected\./);
  assert.doesNotMatch(footer, /All products|Solutions overview|Resources overview|Company overview/);
  assert.doesNotMatch(footer, /SITE\.publicAccess|Explore platform/);
  assert.doesNotMatch(footer, /style=\{\{/);
  for (const unverified of ['bsky.app', 'x.com/Neptlium', 'youtube.com/@neptlium', 'tiktok.com/@neptlium']) assert.doesNotMatch(footer, new RegExp(unverified.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  assert.doesNotMatch(footer, /Neptliumlabs|href=["']#["']/i);
});

test('canonical brand and palette remain authoritative in one visual-direction layer', () => {
  assert.match(brand, /from '@neptlium\/ui'/);
  assert.match(brand, /NeptliumMark/);
  assert.doesNotMatch(brand, /<svg|<path|d="/);
  for (const token of ['#f5f3ee', '#101214', '#0f8f86', '#20afa3', '#343a3f', '#d8d5ce', '#eceae5']) assert.match(css, new RegExp(token, 'i'));
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.doesNotMatch(layout, /production-hardening\.css/);
  for (const retiredImport of ['marketing-shell.css', 'apple-calibration.css', 'product-showcase-calibration.css', 'route-product-consolidation.css', 'detail-product-consolidation.css', 'marketing-production.css', 'unified-design.css']) assert.doesNotMatch(layout, new RegExp(retiredImport.replace('.', '\\.')));
  assert.match(css, /data-home='true'/);
  assert.doesNotMatch(css, /radial-gradient|backdrop-filter:\s*blur\(|filter:\s*blur\(/i);
});

test('marketing remains non-financial authority', () => {
  const marketingCopy = `${page}\n${header}\n${footer}\n${architecture}`;
  assert.doesNotMatch(marketingCopy, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|\bAUM\b|customer count|transaction volume|testimonial|licensed|regulated partner/i);
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
});
