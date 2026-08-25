import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
const css = readFileSync(join(root, 'app/neptlium-visual-direction.css'), 'utf8');

test('marketing root loads the canonical visual-direction layer', () => {
  assert.match(layout, /data-theme="light"/);
  assert.match(layout, /colorScheme:\s*'light'/);
  assert.match(layout, /import '\.\/neptlium-visual-direction\.css';/);
  assert.doesNotMatch(layout, /footer-depth\.css/);
  assert.match(css, /--web-ivory:\s*#f5f3ee/i);
  assert.match(css, /--web-carbon:\s*#101214/i);
  assert.match(css, /--web-teal:\s*#0f8f86/i);
});

test('marketing uses teal as a precision instrument', () => {
  assert.match(css, /--web-teal-interaction:\s*#20afa3/i);
  assert.match(css, /--web-graphite:\s*#343a3f/i);
  assert.match(css, /--web-stone:\s*#d8d5ce/i);
  assert.match(css, /--web-mist:\s*#eceae5/i);
  assert.doesNotMatch(css, /#258be5|#0141f3|#2764ff|#147dff/i);
});

test('responsive and reduced-motion behavior are first-class', () => {
  for (const media of ['68rem', '56rem', '40rem', '24.5rem'])
    assert.match(css, new RegExp(`@media \\(max-width: ${media.replace('.', '\\.')}\\)`));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.authority-actions\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.command-mobile-trigger\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /\.mobile-command-wrap/);
});
