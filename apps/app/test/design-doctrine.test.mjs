import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const capitalPosition = readFileSync(join(root, 'components/product/CapitalPosition.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'app/dashboard/page.tsx'), 'utf8');

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

test('overview capital empty state stays truthful without repeated fabricated values', () => {
  assert.match(capitalPosition, /Capital not established yet\./);
  assert.match(capitalPosition, /Balances appear only after governed capital is available and reconciled\./);
  assert.match(capitalPosition, /Provider observations are never presented as canonical balance\./);
  assert.match(capitalPosition, /View Capital Account/);
  assert.match(capitalPosition, /current governed capability state/);
  assert.match(capitalPosition, /available, disabled, or unsupported/);
  assert.match(capitalPosition, /!empty \?/);
  assert.doesNotMatch(capitalPosition, /\$0(?:\.00)?/);
});

test('overview funding actions and balances are capability- and ledger-gated', () => {
  assert.match(dashboard, /funding status could not be confirmed/i);
  assert.match(dashboard, /No governed customer funding capability is currently exposed/);
  assert.match(dashboard, /currently exposed as enabled for funding/);
  assert.match(dashboard, /Funding rails are exposed, but no rail is currently enabled/);
  assert.match(dashboard, /No funding rail is currently enabled/);
  assert.match(dashboard, /Governed funding capabilities are currently disabled/);
  assert.match(dashboard, /balance \? <FinancialValue valueAtomic=\{balance\.total_atomic\}/);
  assert.match(dashboard, /Not established/);
  assert.doesNotMatch(dashboard, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
});
