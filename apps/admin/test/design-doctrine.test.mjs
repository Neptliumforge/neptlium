import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const tokens = readFileSync(join(root, '../../packages/ui/src/styles/tokens.css'), 'utf8');

test('admin is a light-first institutional operating surface', () => {
  assert.match(layout, /data-theme="light"/);
  assert.match(layout, /colorScheme:\s*['"]light['"]/);
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /@neptlium\/ui\/styles\/tokens\.css/);
  assert.match(tokens, /--n-bg:\s*#ffffff/);
  assert.match(tokens, /--n-ink:\s*#101214/);
  assert.match(tokens, /--color-accent-primary:\s*var\(--n-ink\)/);
  assert.match(tokens, /--color-border-focus:\s*var\(--n-teal-500\)/);
  assert.doesNotMatch(css, /color-scheme:\s*dark\s*;/);
});

test('admin preserves operational typography, numerics and reduced motion', () => {
  assert.match(css, /--font-sans:\s*var\(--n-font-product\)/);
  assert.match(css, /font-family:\s*var\(--font-sans\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /background-image:\s*none\s*!important/);
});
