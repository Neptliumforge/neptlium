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
    /Invest, manage and move capital through one financial platform built for[\s\S]*individuals[\s\S]*and institutions/i,
  );
  assert.match(page, /href=\{SITE\.personalSignUpUrl\}[\s\S]*Get started/);
  assert.match(page, /href="\/institutional"[\s\S]*For institutions/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('homepage uses clearly illustrative product compositions without fabricated customer state', () => {
  for (const visual of ['CapitalRails', 'WorldStage', 'ProductStage', 'SystemMap'])
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
  assert.match(homepage, /@media\(max-width:1080px\)/);
  assert.match(homepage, /@media\(max-width:760px\)/);
  assert.match(homepage, /@media\(max-width:390px\)/);
  assert.match(homepage, /prefers-reduced-motion:reduce/);
});

test('homepage architecture introduces financial world, product families, movement, product character, coherence and intelligence', () => {
  for (const context of [
    'Know where your capital stands',
    'Put capital to work',
    'Every movement has authority',
    'Everything you’ve invested in. One portfolio',
    'Operate capital with control',
    'Intelligence for every capital decision',
  ]) {
    assert.match(page, new RegExp(context.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'));
  }
  for (const family of ['Capital', 'Treasury', 'Institutional', 'Infrastructure'])
    assert.match(page, new RegExp(`label: '${family}'`));
  for (const href of ['/capital', '/treasury', '/institutional', '/infrastructure', '/insights'])
    assert.match(page, new RegExp(href.replaceAll('/', '\\/')));
  assert.match(page, /Explore \{family\.label\}/);
  assert.match(page, /Explore Intelligence/);
  assert.doesNotMatch(
    page,
    /currently available public capability|not configured|capability unavailable/i,
  );
});
