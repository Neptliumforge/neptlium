import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = path => readFileSync(resolve(root, path), 'utf8');

test('shared design system forwards to canonical UI tokens', () => {
  const readme = read('packages/design-system/README.md');
  const tokens = read('packages/ui/src/styles/tokens.css');
  assert.match(readme, /@neptlium\/ui\/styles\/tokens\.css/);
  for (const token of ['--color-canvas:', '--color-accent-primary:', '--color-text-primary:', '--color-border-focus:', '--color-success:', '--color-danger:']) {
    assert.ok(tokens.includes(token), 'Missing canonical token: ' + token);
  }
});

test('shared button retains accessible focus and loading semantics', () => {
  const button = read('packages/ui/src/components/Button.tsx');
  assert.match(button, /focus-visible:/);
  assert.match(button, /disabled=\{disabled \|\| loading\}/);
  assert.match(button, /loading &&/);
});

test('shared motion constants have bounded durations', () => {
  const motion = read('packages/ui/src/theme/motion.ts');
  for (const key of ['fast', 'normal', 'slow']) {
    assert.match(motion, new RegExp(key + ':\\s*0\\.\\d+'));
  }
});

test('primary badge uses canonical mineral-teal accent, not legacy emerald', () => {
  const badge = read('packages/ui/src/components/Badge.tsx');
  assert.match(badge, /primary:\s*"bg-accent-primary\/12 text-accent-primary"/);
  assert.doesNotMatch(badge, /accent-emerald/);
  assert.match(badge, /aria-hidden="true"/);
});
