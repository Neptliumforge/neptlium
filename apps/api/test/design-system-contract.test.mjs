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

test('sidebar keyboard focus is visible and respects reduced motion', () => {
  const sidebar = read('packages/ui/src/shell/Sidebar.tsx');
  assert.match(sidebar, /focus-visible:ring-2/);
  assert.match(sidebar, /motion-reduce:transition-none/);
  assert.match(sidebar, /aria-current=\{isActive \? "page" : undefined\}/);
});

test('closed mobile drawer is inert and open drawer traps keyboard focus', () => {
  const mobile = read('packages/ui/src/shell/MobileNavigation.tsx');
  assert.match(mobile, /inert=\{!open\}/);
  assert.match(mobile, /event\.key === "Escape"/);
  assert.match(mobile, /event\.key !== "Tab"/);
  assert.match(mobile, /triggerRef\.current\?\.focus\(\)/);
  assert.match(mobile, /motion-reduce:transition-none/);
});

test('admin shell uses canonical sidebar surface and constrains main overflow', () => {
  const admin = read('apps/admin/components/admin/AdminShell.tsx');
  assert.match(admin, /bg-sidebar/);
  assert.doesNotMatch(admin, /bg-\[#[0-9a-fA-F]{3,8}\]/);
  assert.match(admin, /min-w-0 flex-1/);
});
