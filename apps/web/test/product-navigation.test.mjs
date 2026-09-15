import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('primary products are the four canonical Neptlium product families', () => {
  assert.match(architecture, /export const PRIMARY_PRODUCTS = PRODUCTS;/);
  for (const label of ['Neptlium Capital', 'Neptlium Treasury', 'Neptlium Institutional', 'Neptlium Infrastructure']) {
    assert.match(architecture, new RegExp(`label: '${label}'`));
  }
});

test('legacy performance and capital-universe routes remain supporting rather than primary products', () => {
  assert.match(architecture, /'\/products\/performance': 'public-supporting-noindex'/);
  assert.match(architecture, /'\/products\/capital-universe': 'public-supporting-noindex'/);
});
