import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const capitalPosition = readFileSync(join(root, 'components/product/CapitalPosition.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'app/dashboard/page.tsx'), 'utf8');
const bootstrap = readFileSync(join(root, 'lib/product/bootstrap.ts'), 'utf8');
const experience = readFileSync(join(root, 'components/product/OperatingExperience.tsx'), 'utf8');

test('authenticated product consumes shared brand semantics with restrained institutional authority', () => {
  assert.match(css, /@neptlium\/ui\/styles\/brand\.css/);
  assert.match(css, /@neptlium\/ui\/styles\/tokens\.css/);
  assert.match(css, /var\(--color-brand\)/);
  assert.doesNotMatch(css, /--color-canvas:\s*#[0-9a-f]/i);
  assert.doesNotMatch(css, /--color-sidebar:\s*#[0-9a-f]/i);
  assert.doesNotMatch(css, /#258BE5|#319EED/i);
  assert.doesNotMatch(css, /radial-gradient|linear-gradient/i);
});

test('authenticated product remains operationally quiet and numerically precise', () => {
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

test('overview derives governed capital state from the shared bootstrap without fabricated valuation', () => {
  assert.match(dashboard, /OverviewExperience/);
  assert.match(bootstrap, /getOverviewState\(\)/);
  assert.match(bootstrap, /getCanonicalBalances\(\)/);
  assert.match(bootstrap, /getFundingCapabilities\(\)/);
  assert.match(bootstrap, /getTransferCapabilities\(\)/);
  assert.match(experience, /snapshot\.balances\.state === 'READY'/);
  assert.match(experience, /Your capital/);
  assert.match(experience, /Shown separately because no verified combined valuation is available/);
  assert.match(experience, /PrimaryActions/);
  assert.match(experience, /item\.state === 'ENABLED'/);
  assert.doesNotMatch(experience, /balance\?\.total_atomic\s*\?\?\s*['\"]0['\"]/);
});
