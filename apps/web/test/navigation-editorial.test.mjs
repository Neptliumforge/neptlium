import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('primary navigation is the canonical four-family architecture plus insights and company', () => {
  const navBlock = architecture.slice(architecture.indexOf('export const NAVIGATION'), architecture.indexOf('export const INDEXABLE_ROUTES'));
  for (const label of ['Capital', 'Treasury', 'Institutional', 'Infrastructure', 'Insights', 'Company']) {
    assert.match(navBlock, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(navBlock, /label: 'Press'|label: 'Performance'|label: 'Capital Universe'|label: 'Products'|label: 'Solutions'/);
});

test('products and solutions remain supporting architecture rather than primary navigation domains', () => {
  assert.match(architecture, /export const PRODUCTS/);
  assert.match(architecture, /export const SOLUTIONS/);
  assert.match(architecture, /'\/products': 'public-supporting-noindex'/);
  assert.match(architecture, /'\/solutions': 'canonical-indexable'/);
});
