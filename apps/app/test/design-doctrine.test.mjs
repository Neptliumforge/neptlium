import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const capitalPosition = readFileSync(join(root, 'components/product/CapitalPosition.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'app/dashboard/page.tsx'), 'utf8');

test('authenticated product consumes shared brand semantics with restrained institutional authority', () => {
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);

  // Carbon remains the operating authority color.
  assert.match(css, /--color-accent-primary:\s*var\(--n-carbon\)/);
  assert.match(css, /--color-border-focus:\s*#101214/);
  assert.match(css, /--color-canvas:\s*var\(--n-canvas\)/);

  // Light authenticated chrome is warm-neutral; dark mode returns to Carbon.
  assert.match(css, /--color-sidebar:\s*#f5f3ee/);
  assert.match(css, /--color-sidebar:\s*#101214/);

  // Mineral Teal is permitted only as a restrained semantic/focus accent.
  assert.match(css, /--n-mineral-teal:\s*#0f8f86/);
  assert.match(css, /--shadow-focus-ring:/);

  // Retired decorative product blues remain absent.
  assert.doesNotMatch(css, /#258BE5|#319EED/i);

  // Operating surfaces do not use atmospheric gradients.
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
  // Funding actions are authorized only by governed capability state.
  assert.match(dashboard, /const canFund = !capabilityError && enabledFunding\.length > 0/);
  assert.match(dashboard, /capabilities\.filter\(\(item\) => item\.state === 'ENABLED'\)/);
  assert.match(dashboard, /canFund \? \(/);

  // Capability failures do not impersonate enabled funding.
  assert.match(dashboard, /Funding unavailable/);
  assert.match(dashboard, /Funding not enabled/);

  // Canonical balances remain ledger-backed and absence is non-numeric.
  assert.match(dashboard, /balances\.length === 0/);
  assert.match(dashboard, /No capital yet/);
  assert.match(dashboard, /FinancialValue valueAtomic=\{balance\.total_atomic\}/);
  assert.doesNotMatch(dashboard, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
});
