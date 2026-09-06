import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
const css = readFileSync(join(root, 'app/global.css'), 'utf8');

test('admin is a light-first institutional operating surface', () => {
  assert.match(layout, /data-theme="light"/);
  assert.match(layout, /colorScheme:\s*"light"/);
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /--color-canvas:\s*#ffffff/);
  assert.match(css, /--color-text-primary:\s*#101214/);
  assert.match(css, /--color-accent-primary:\s*#101214/);
  assert.match(css, /--color-border-default:\s*#dfe2e1/);
  assert.doesNotMatch(css, /color-scheme:\s*dark\s*;/);
});

test('admin preserves operational typography, numerics and reduced motion', () => {
  assert.match(css, /font-family:\s*var\(--n-font-product\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /background-image:\s*none\s*!important/);
});
