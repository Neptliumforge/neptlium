import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');

test('authenticated product consumes shared brand semantics rather than a private palette', () => {
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /--color-canvas:\s*var\(--n-brand-canvas\)/);
  assert.match(css, /--color-accent-primary:\s*var\(--n-brand-blue\)/);
  assert.match(css, /--color-canvas:\s*var\(--n-brand-absolute-black\)/);
  assert.match(css, /--color-surface-1:\s*var\(--n-brand-blue-black\)/);
});

test('authenticated product remains operationally quiet and numerically precise', () => {
  assert.match(css, /font-family:\s*var\(--n-font-product\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /background-image:\s*none\s*!important/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /linear-gradient\([^)]*var\(--n-brand-blue\)[^)]*\)/);
});
