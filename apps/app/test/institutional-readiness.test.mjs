import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const productState = await readFile(new URL('../components/product/ProductState.tsx', import.meta.url), 'utf8');

test('frontend does not own an atomic precision map', () => {
  assert.equal(productState.includes('const atomicPrecision:'), false);
  assert.equal(productState.includes('atomicPrecision = {'), false);
  assert.equal(productState.includes('formatAtomicAmount(value: string, asset: string, decimals?: number)'), true);
});

test('financial display accepts backend-supplied precision', () => {
  assert.equal(productState.includes('decimals?: number | null'), true);
  assert.equal(productState.includes('formatAtomicAmount(valueAtomic, asset, decimals ?? undefined)'), true);
});
