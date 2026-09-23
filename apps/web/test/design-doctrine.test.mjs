import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8');
const css = readFileSync(join(root, 'app/neptlium-visual-direction.css'), 'utf8');

test('marketing root loads the canonical visual-direction and experience layers', () => {
  assert.match(layout, /<html lang="en" suppressHydrationWarning>/);
  assert.match(layout, /colorScheme:\s*'light dark'/);
  assert.match(layout, /import '\.\/neptlium-visual-direction\.css';/);
  assert.doesNotMatch(layout, /experience-v1\.css/);
  assert.doesNotMatch(layout, /footer-depth\.css/);
  assert.match(css, /--web-ivory:\s*var\(--color-text-primary\)/i);
  assert.match(css, /--web-carbon:\s*var\(--color-canvas\)/i);
  assert.match(css, /--web-teal:\s*var\(--color-brand\)/i);
});

test('marketing uses teal as a precision instrument', () => {
  assert.match(css, /--web-teal-interaction:\s*var\(--color-brand-emphasis\)/i);
  assert.match(css, /--web-graphite:\s*var\(--n-graphite-3\)/i);
  assert.match(css, /--web-stone:\s*var\(--color-border-strong\)/i);
  assert.match(css, /--web-mist:\s*var\(--color-surface-2\)/i);
  assert.doesNotMatch(css, /#258be5|#0141f3|#2764ff|#147dff/i);
});

test('responsive and reduced-motion behavior are first-class', () => {
  for (const media of ['68rem', '56rem', '40rem', '24.5rem'])
    assert.match(css, new RegExp(`@media \\(max-width: ${media.replace('.', '\\.')}\\)`));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.authority-actions\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /\.command-mobile-trigger\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(css, /\.mobile-command-wrap/);
});
