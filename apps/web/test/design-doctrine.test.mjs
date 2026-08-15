import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
const css = readFileSync(join(root, 'app/unified-design.css'), 'utf8');

test('marketing root is light-first while preserving controlled authority sections', () => {
  assert.match(layout, /data-theme="light"/);
  assert.match(layout, /colorScheme:\s*'light'/);
  assert.match(css, /--np-paper:\s*var\(--n-brand-canvas\)/);
  assert.match(css, /--np-authority:\s*var\(--n-brand-obsidian\)/);
  assert.match(css, /\.marketing-capital-operations,[\s\S]*\.marketing-conversion/);
});

test('marketing uses shared identity semantics and restrained interaction', () => {
  assert.match(css, /--np-action:\s*var\(--n-brand-blue\)/);
  assert.match(css, /background-image:\s*none\s*!important/);
  assert.match(css, /box-shadow:\s*none\s*!important/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /--np-precision-blue:/);
  assert.doesNotMatch(css, /--np-absolute-black:/);
});
