import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const homepage = readFileSync(new URL('../app/home-elite.module.css', import.meta.url), 'utf8');

test('current homepage states a concise capital proposition and focused exploration paths', () => {
  assert.match(page, /Capital, intelligently managed\./);
  assert.match(
    page,
    /Discover the ideas behind an investment/i,
  );
  assert.match(page, /href=\{SITE\.personalSignUpUrl\}[\s\S]*Get started/);
  assert.match(page, /href="\/investments"[\s\S]*Explore investing/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage uses clearly illustrative product compositions without fabricated customer state', () => {
  for (const visual of ['ProductStage', 'InvestCollections'])
    assert.match(page, new RegExp(visual));
  assert.match(
    page,
    /Illustrative interface only\.[\s\S]*No customer balances, returns or performance data are[\s\S]*shown\./i,
  );
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

test('homepage architecture introduces financial world, product families, movement, product character, coherence and intelligence', () => {
  for (const context of [
    'Know where your capital stands',
    'Discover investments with a clearer view',
    'A clearer path from investing',
    'Treasury & institutional',
    'Understand the market',
  ]) {
    assert.match(page, new RegExp(context.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  }
  for (const family of ['Capital', 'Treasury', 'Institutional', 'Portfolio'])
    assert.match(page, new RegExp(family, 'i'));
  for (const href of ['/capital', '/treasury', '/institutional', '/investments', '/portfolio'])
    assert.match(page, new RegExp(href.replaceAll('/', '\\/')));
  assert.match(page, /InvestCollections/);
  assert.match(page, /Research & intelligence/);
  assert.doesNotMatch(
    page,
    /currently available public capability|not configured|capability unavailable/i,
  );
});
