import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('app/page.tsx');
const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const site = read('lib/content/site.ts');
const homeCss = read('app/marketing-home.css');
const shell = `${page}\n${layout}\n${header}\n${footer}\n${site}\n${homeCss}`;

test('hero preserves canonical proposition and exactly one H1', () => {
  assert.match(page, /DIGITAL CAPITAL OPERATING INFRASTRUCTURE/);
  assert.match(page, /Capital, organized around you\./);
  assert.match(page, /Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage remains exactly six compositions', () => {
  assert.equal((page.match(/data-composition="[1-6]"/g) ?? []).length, 6);
  for (const copy of [
    'Digital capital is fragmented by default.',
    'One system for understanding and operating capital.',
    'Structure capital. Govern policy. Connect infrastructure.',
    'Control is part of the architecture.',
    'Capital, made operational.',
  ]) assert.match(page, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('dark-first marketing tokens are local to apps/web', () => {
  for (const value of ['#000000','#05060b','#050b15','#0a111f','#0c1324','#0d162a','#151f3d','#258be5','#319eed','#f8f9fc','#e7eaf0','#b7bbc6','#9297a4']) {
    assert.equal(homeCss.toLowerCase().includes(value), true, `Missing marketing token ${value}`);
  }
  assert.match(homeCss, /--marketing-blue:\s*#258be5/i);
  assert.match(homeCss, /--marketing-blue-hover:\s*#319eed/i);
  assert.doesNotMatch(homeCss, /#0141f3|#026ffa|#53d1f8|#c0f5fc/i);
});

test('Enter the App is primary and Explore Neptlium is secondary', () => {
  const hero = page.slice(page.indexOf('data-composition="1"'), page.indexOf('data-composition="2"'));
  assert.match(hero, /className="button production-primary"[^>]*>Enter the App/);
  assert.match(hero, /className="production-secondary"[^>]*>Explore Neptlium/);
  assert.ok(hero.indexOf('Enter the App') < hero.indexOf('Explore Neptlium'));
  assert.match(site, /https:\/\/app\.neptlium\.com\/auth\/sign-in/);
});

test('thesis is architectural rather than an equal-card flow', () => {
  for (const source of ['Wallets','Exchanges','Custody','Networks','Treasury systems']) assert.match(page, new RegExp(source));
  for (const output of ['Portfolio','Treasury','Policy','Allocation','Authorization','Operational record']) assert.match(page, new RegExp(output));
  assert.match(page, /system-flow-core/);
  assert.doesNotMatch(homeCss, /grid-template-columns:\s*repeat\(8/);
});

test('product and allocation copy remain truthful and execution-closed', () => {
  for (const label of ['Overview','Portfolio','Capital Account']) assert.match(page, new RegExp(label));
  for (const state of ['Observe','Model','Authorize']) assert.match(page, new RegExp(state));
  assert.match(page, /Authorization does not imply autonomous execution or active rebalancing\./);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|candlestick|ticker/i);
});

test('root theme is no longer forcibly light', () => {
  assert.match(layout, /colorScheme:\s*'dark light'/);
  assert.match(layout, /#05060B/);
  assert.match(layout, /data-theme="dark"/);
  assert.doesNotMatch(layout, /themeColor:\s*'#FFFFFF'/);
  assert.doesNotMatch(layout, /data-theme="light"/);
});

test('navigation preserves institutional IA and mobile accessibility', () => {
  for (const section of ['Platform', 'Capital', 'Connectivity', 'Governance', 'Company']) assert.match(header, new RegExp(`label: '${section}'`));
  assert.doesNotMatch(header, /label:\s*'Wallet'/);
  assert.match(header, /aria-expanded=/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key === 'Escape'/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /trigger\.current\?\.focus\(\)/);
  assert.match(homeCss, /mobile-command-sheet/);
  assert.match(homeCss, /#05060b/i);
});

test('footer is corporate closure and does not duplicate product navigation', () => {
  for (const label of ['Legal','Corporate','Social','Privacy','About','Contact','GitHub']) assert.match(footer, new RegExp(label));
  assert.match(footer, /Capital, made operational\./);
  assert.doesNotMatch(footer, /Portfolio|Capital Account|Treasury|Allocation|Wallet|Deposit|Withdraw/);
  assert.doesNotMatch(footer, /Instagram|Twitter|linkedin\.com|x\.com/);
});

test('responsive and reduced-motion contracts are explicit', () => {
  assert.match(homeCss, /@media \(max-width: 1024px\)/);
  assert.match(homeCss, /@media \(max-width: 768px\)/);
  assert.match(homeCss, /@media \(max-width: 430px\)/);
  assert.match(homeCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(homeCss, /:focus-visible/);
});

test('legacy white cobalt crystalline homepage assumptions are absent from active homepage layer', () => {
  assert.doesNotMatch(homeCss, /crystalline|premium white|cyan|signature gradient|glassmorphism/i);
  assert.doesNotMatch(page, /hero-crystal|dashboard screenshot|fake balance/i);
  assert.match(page, /hero-structure-plane/);
});

test('marketing remains non-financial authority', () => {
  assert.doesNotMatch(shell, /SUPABASE_SERVICE_ROLE_KEY|createSupabaseAdminClient|\.from\(|\.rpc\(/);
  assert.doesNotMatch(shell, /href=["']#["']/);
});
