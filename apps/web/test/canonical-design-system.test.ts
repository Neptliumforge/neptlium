import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../../..');
const tokens = readFileSync(resolve(root, 'packages/ui/src/styles/tokens.css'), 'utf8');
const appCss = readFileSync(resolve(root, 'apps/app/app/global.css'), 'utf8');
const treasuryCss = readFileSync(resolve(root, 'apps/treasury/app/global.css'), 'utf8');

test('canonical token authority contains approved Neptlium palette and semantics', () => {
  for (const value of ['#080c10', '#041014', '#0c1014', '#0c1c20', '#4a9992', '#59b7ae', '#00cec5']) {
    assert.match(tokens.toLowerCase(), new RegExp(value));
  }
  for (const token of [
    '--color-background',
    '--color-surface-interactive',
    '--color-text-primary',
    '--color-brand',
    '--color-financial-positive',
    '--color-financial-negative',
    '--color-status-pending',
    '--color-status-processing',
    '--color-status-complete',
    '--color-status-failed',
    '--color-status-restricted',
    '--color-status-reconciling',
    '--text-display-xl',
    '--text-financial-xl',
    '--container-operational',
  ]) {
    assert.match(tokens, new RegExp(token));
  }
});

test('canonical token authority supports deliberate light and dark appearances', () => {
  assert.match(tokens, /html\[data-theme='light'\]/);
  assert.match(tokens, /html\[data-theme='dark'\]/);
  assert.match(tokens, /prefers-reduced-motion/);
});

test('Capital and Treasury consume the shared token authority', () => {
  assert.match(appCss, /@neptlium\/ui\/styles\/tokens\.css/);
  assert.match(treasuryCss, /@neptlium\/ui\/styles\/tokens\.css/);
  assert.doesNotMatch(treasuryCss, /--app-teal:\s*#[0-9a-f]/i);
  assert.doesNotMatch(treasuryCss, /--app-black:\s*#[0-9a-f]/i);
});
