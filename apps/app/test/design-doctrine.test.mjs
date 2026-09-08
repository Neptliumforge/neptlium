import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const capitalPosition = readFileSync(join(root, 'components/product/CapitalPosition.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'app/dashboard/page.tsx'), 'utf8');

test('authenticated product consumes shared brand semantics with monochrome operating authority', () => {
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /--color-accent-primary:\s*var\(--n-carbon\)/);
  assert.match(css, /--color-border-focus:\s*#111111/);
  assert.match(css, /--color-canvas:\s*var\(--n-canvas\)/);
  assert.match(css, /--color-sidebar:\s*var\(--n-carbon\)/);
  assert.doesNotMatch(css, /#258BE5|#319EED|#0f8f86|#20afa3/i);
  assert.doesNotMatch(css, /radial-gradient|linear-gradient/i);
});

test('authenticated product remains operationally quiet and numerically precise', () => {
  assert.match(css, /font-family:\s*var\(--n-font-product\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /background-image:\s*none\s*!important/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
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

test('overview funding actions and balances remain capability- and ledger-gated', () => {
  assert.match(dashboard, /const canFund = !capabilityError && enabledFunding\.length > 0/);
  assert.match(dashboard, /canFund \? \(/);
  assert.match(dashboard, /Funding state unavailable/);
  assert.match(dashboard, /Review funding state/);
  assert.match(dashboard, /balances\.length === 0/);
  assert.match(dashboard, /FinancialValue valueAtomic=\{balance\.total_atomic\}/);
  assert.doesNotMatch(dashboard, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
});
