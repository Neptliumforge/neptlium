import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('primary navigation uses canonical progressive product discovery', () => {
  const navBlock = architecture.slice(
    architecture.indexOf('export const NAVIGATION'),
    architecture.indexOf('export const INDEXABLE_ROUTES'),
  );
  for (const label of ['Products', 'Solutions', 'Institutional', 'Insights']) {
    assert.match(navBlock, new RegExp(`label: '${label}'`));
  }
  assert.doesNotMatch(navBlock, /label: 'Individuals'|label: 'Institutions'|label: 'Company'/);
});

test('product discovery exposes the six canonical capabilities', () => {
  const productBlock = architecture.slice(
    architecture.indexOf('export const PRODUCT_LINKS'),
    architecture.indexOf('export const NAVIGATION'),
  );
  for (const label of ['Capital', 'Portfolio', 'Investments', 'Treasury', 'Intelligence', 'Infrastructure']) {
    assert.match(productBlock, new RegExp(`label: '${label}'`));
  }
});
