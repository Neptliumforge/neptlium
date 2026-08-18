import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const reveal = read('components/reveal.tsx');
const site = read('lib/content/site.ts');
const unifiedCss = read('app/unified-design.css');
const productionExperienceCss = read('app/production-experience.css');
const shell = `${page}\n${layout}\n${header}\n${footer}\n${reveal}\n${site}\n${unifiedCss}\n${productionExperienceCss}`;

test('hero preserves canonical proposition and exactly one H1', () => {
  assert.match(page, /DIGITAL CAPITAL OPERATING INFRASTRUCTURE/);
  assert.match(page, /Capital, organized around you\./);
  assert.match(page, /Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage remains exactly six compositions and carries the locked operating narrative', () => {
  assert.equal((page.match(/data-composition="[1-6]"/g) ?? []).length, 6);
  const narrative = ['Fragmentation', 'Understanding', 'Organization', 'Intelligence', 'Policy', 'Control', 'Operation'];
  let cursor = -1;
  for (const stage of narrative) {
    const index = page.indexOf(`'${stage}'`, cursor + 1);
    assert.ok(index > cursor, `${stage} must appear after the previous operating stage`);
    cursor = index;
  }
  for (const copy of [
    'Digital capital is fragmented by default.',
    'Understand capital. Then organize it.',
    'Turn structure into governed decisions.',
    'Control is part of the architecture.',
    'Capital, made operational.',
  ]) assert.match(page, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('locked CTA language is used across the public entry points', () => {
  for (const label of ['Explore the platform', 'Enter Neptlium', 'Talk to Neptlium']) assert.match(shell, new RegExp(label));
  const hero = page.slice(page.indexOf('data-composition="1"'), page.indexOf('data-composition="2"'));
  assert.match(hero, /className="button production-primary"[^>]*>Enter Neptlium/);
  assert.match(hero, /className="production-secondary"[^>]*>Explore the platform/);
  assert.match(site, /https:\/\/app\.neptlium\.com\/auth\/sign-in/);
});

test('navigation is exactly Platform, Solutions and Company with two destinations each', () => {
  for (const section of ['Platform', 'Solutions', 'Company']) assert.match(header, new RegExp(`label: '${section}'`));
  for (const removed of ['Capital', 'Connectivity', 'Governance']) assert.doesNotMatch(header, new RegExp(`label: '${removed}'`));
  assert.match(header, /links: readonly \[NavLink, NavLink\]/);
  assert.match(header, /Platform overview/);
  assert.match(header, /Neptlium Link/);
  assert.match(header, /Capital operations/);
  assert.match(header, /Policy & allocation/);
  assert.match(header, /About Neptlium/);
  assert.match(header, /Talk to Neptlium/);
});

test('navigation preserves keyboard and mobile accessibility', () => {
  assert.match(header, /aria-expanded=/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key === 'Escape'/);
  assert.match(header, /event\.key !== 'ArrowDown'/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /trigger\.current\?\.focus\(\)/);
});

test('product and allocation copy remain truthful and execution-closed', () => {
  for (const label of ['Overview', 'Portfolio', 'Capital Account']) assert.match(page, new RegExp(label));
  for (const state of ['Observe', 'Model', 'Authorize']) assert.match(page, new RegExp(state));
  assert.match(page, /Authorization does not imply autonomous execution or active rebalancing\./);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|candlestick|ticker/i);
});

test('root follows the authoritative light-first shared design system', () => {
  assert.match(layout, /colorScheme:\s*'light'/);
  assert.match(layout, /themeColor:\s*'#FFFFFF'/);
  assert.match(layout, /data-theme="light"/);
  assert.match(layout, /import '\.\/unified-design\.css';/);
  assert.match(layout, /import '\.\/production-experience\.css';/);
  assert.match(unifiedCss, /--np-paper:\s*var\(--n-brand-canvas\)/);
  assert.match(unifiedCss, /--np-authority:\s*var\(--n-brand-obsidian\)/);
});

test('semantic homepage content remains visible without client hydration or motion', () => {
  assert.doesNotMatch(reveal, /['"]use client['"]|IntersectionObserver|useEffect|useState/);
  assert.match(reveal, /reveal is-visible/);
  assert.match(productionExperienceCss, /\.reveal,\s*\n\.reveal\.is-visible\s*\{[\s\S]*?opacity:\s*1;/);
  assert.match(productionExperienceCss, /capital-stack-focus::after[\s\S]*?z-index:\s*0;/);
  assert.match(productionExperienceCss, /capital-stack-focus > \*[\s\S]*?z-index:\s*1;/);
});

test('footer closes the institutional shell with real internal destinations', () => {
  for (const label of ['Platform', 'Resources', 'Company', 'Legal', 'Connect']) assert.match(footer, new RegExp(`label: '${label}'`));
  for (const destination of [
    '/platform',
    '/portfolio-intelligence',
    '/capital-account',
    '/treasury',
    '/allocation',
    '/research',
    '/learn',
    '/security',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/risk-disclosure',
  ]) assert.match(footer, new RegExp(destination.replaceAll('/', '\\/')));
  assert.doesNotMatch(footer, /href=["']#["']/);
});

test('footer exposes only approved or repository-authoritative connect destinations', () => {
  for (const destination of [
    'https://bsky.app/profile/neptlium.bsky.social',
    'https://x.com/Neptlium',
    'https://youtube.com/@neptlium',
    'https://www.tiktok.com/@neptlium',
    'https://github.com/Neptliumlabs',
  ]) {
    assert.match(footer, new RegExp(destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(layout, new RegExp(destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(footer, /\?si=|\?_r=|&_t=|linkedin\.com|instagram\.com|threads\.net|facebook\.com|discord|t\.me/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.match(footer, /opens in a new tab/);
});

test('marketing remains non-financial authority', () => {
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
  assert.doesNotMatch(shell, /href=["']#["']/);
});
