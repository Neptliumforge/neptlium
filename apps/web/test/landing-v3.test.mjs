import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../app/home-elite.module.css', import.meta.url), 'utf8');

test('homepage leads with the Capital Operating Platform proposition and clear journeys', () => {
  assert.match(page, /Capital, intelligently managed\./);
  assert.match(page, /The Capital Operating Platform/);
  assert.match(page, /Every movement has authority\. Every position has evidence\./);
  assert.match(page, /href="\/platform"[\s\S]*Explore the platform/);
  assert.match(page, /href="\/company"[\s\S]*About Neptlium/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage uses clearly illustrative authority and research compositions', () => {
  for (const visual of ['AuthorityStage', 'InvestCollections'])
    assert.match(page, new RegExp(visual));
  assert.match(page, /Illustrative model/);
  assert.match(page, /does not represent a live payment, settlement or customer account/);
  assert.doesNotMatch(
    page,
    /\$[0-9]|[0-9]+(?:\.[0-9]+)?%|guaranteed returns?|projected returns?|customer AUM/i,
  );
});

test('elite homepage styling is scoped and responsive after the established global system', () => {
  assert.match(layout, /neptlium-visual-direction\.css/);
  assert.match(page, /home-elite\.module\.css/);
  assert.match(homepage, /@media\s*\(max-width:\s*1080px\)/);
  assert.match(homepage, /@media\s*\(max-width:\s*760px\)/);
  assert.match(homepage, /@media\s*\(max-width:\s*390px\)/);
  assert.match(homepage, /prefers-reduced-motion:\s*reduce/);
});

test('homepage architecture explains the canonical six-capability platform', () => {
  for (const capability of ['Capital', 'Portfolio', 'Investments', 'Treasury', 'Intelligence', 'Infrastructure'])
    assert.match(page, new RegExp(capability, 'i'));
  for (const href of ['/capital', '/portfolio', '/investments', '/treasury', '/intelligence', '/infrastructure'])
    assert.match(page, new RegExp(href.replaceAll('/', '\\/')));
  for (const principle of ['authority', 'evidence', 'authorization', 'reconciliation'])
    assert.match(page, new RegExp(principle, 'i'));
  assert.match(page, /InvestCollections/);
  assert.match(page, /Treasury/);
  assert.match(page, /Developer documentation/);
});
