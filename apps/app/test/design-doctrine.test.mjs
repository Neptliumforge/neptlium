import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const tokens = readFileSync(join(root, '../../packages/ui/src/styles/tokens.css'), 'utf8');
const capitalPosition = readFileSync(join(root, 'components/product/CapitalPosition.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'app/dashboard/page.tsx'), 'utf8');

test('authenticated product consumes shared brand semantics with restrained institutional authority', () => {
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /@neptlium\/ui\/styles\/tokens\.css/);

  // Shared semantic authority remains White / Carbon / Graphite / Mineral Teal.
  assert.match(tokens, /--color-canvas:\s*var\(--n-bg\)/);
  assert.match(tokens, /--color-accent-primary:\s*var\(--n-ink\)/);
  assert.match(tokens, /--color-sidebar:\s*var\(--n-black\)/);
  assert.match(tokens, /--color-border-focus:\s*var\(--n-teal-500\)/);
  assert.match(tokens, /--n-teal-500:\s*#0f8f86/);
  assert.match(css, /--color-sidebar:\s*#101214/);

  // Retired decorative product blues remain absent.
  assert.doesNotMatch(`${css}\n${tokens}`, /#258BE5|#319EED/i);

  // Operating surfaces do not use atmospheric gradients.
  assert.doesNotMatch(css, /radial-gradient|linear-gradient/i);
});

test('authenticated product remains operationally quiet and numerically precise', () => {
  assert.match(css, /--font-sans:\s*var\(--n-font-product\)/);
  assert.match(css, /font-family:\s*var\(--font-sans\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /background-image:\s*none\s*!important/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('overview capital empty state stays truthful without repeated fabricated values', () => {
  assert.match(capitalPosition, /Capital not established yet\./);
  assert.match(
    capitalPosition,
    /Balances appear only after governed capital is available and reconciled\./,
  );
  assert.match(capitalPosition, /Provider observations are never presented as canonical balance\./);
  assert.match(capitalPosition, /View Capital Account/);
  assert.match(capitalPosition, /current governed capability response/);
  assert.doesNotMatch(capitalPosition, /unsupported|coming soon/i);
  assert.match(capitalPosition, /!empty \?/);
  assert.doesNotMatch(capitalPosition, /\$0(?:\.00)?/);
});

test('overview represents governed capital state without valuation or execution actions', () => {
  // Capability and canonical balance inputs remain API-authoritative.
  assert.match(dashboard, /getFundingCapabilities/);
  assert.match(dashboard, /getTransferCapabilities/);
  assert.match(dashboard, /item\.state === 'ENABLED'/);
  assert.match(dashboard, /balances\.length > 0/);

  // The operating home communicates state without exposing amounts or shortcuts.
  assert.match(dashboard, /Capital Operating Environment/);
  assert.match(dashboard, /Capital state/);
  assert.match(dashboard, /No items require your attention\./);
  assert.doesNotMatch(dashboard, /FinancialValue|Fund capital|#deposit/);
  assert.doesNotMatch(dashboard, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
});
