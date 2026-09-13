import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('primary navigation is the five-domain investor architecture', () => {
  const navBlock = architecture.slice(architecture.indexOf('export const NAVIGATION'), architecture.indexOf('export const INDEXABLE_ROUTES'));
  for (const label of ['Platform','Investments','Insights','Security','Company']) assert.match(navBlock, new RegExp(`label: '${label}'`));
  assert.doesNotMatch(navBlock, /label: 'Press'|label: 'Performance'|label: 'Capital Universe'/);
});

test('products and solutions remain second-level architecture', () => {
  assert.match(architecture, /export const PRODUCTS/);
  assert.match(architecture, /export const SOLUTIONS/);
  assert.match(architecture, /label: 'Products', href: '\/products'/);
  assert.match(architecture, /label: 'Solutions', href: '\/solutions'/);
});
