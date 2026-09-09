import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('authenticated capability presentation is mapped only from backend states', () => {
  const productState = read('components/product/ProductState.tsx');
  const capitalAccount = read('app/dashboard/capital-account/CapitalAccountView.tsx');
  const treasury = read('app/dashboard/treasury/TreasuryView.tsx');

  assert.match(productState, /export type BackendCapabilityState = 'ENABLED' \| 'DISABLED' \| 'NOT_CONFIGURED' \| 'INELIGIBLE'/);
  assert.match(productState, /productStateFromCapability/);
  assert.match(capitalAccount, /productStateFromCapability\(selected\.state\)/);
  assert.match(treasury, /productStateFromCapability\(item\.state\)/);
  assert.doesNotMatch(`${capitalAccount}\n${treasury}`, /unsupported|not supported|coming soon/i);
});

test('legacy frontend capability assumptions no longer exist', () => {
  for (const path of [
    'lib/capabilities.ts',
    'lib/services/deposit.ts',
    'lib/services/transfer.ts',
    'components/product/CapitalAccountExperience.tsx',
    'app/dashboard/allocations/AllocationModes.tsx',
  ]) assert.equal(existsSync(resolve(root, path)), false, path);
});

test('orphaned user routes redirect instead of inventing capability state', () => {
  assert.match(read('app/dashboard/counterparties/page.tsx'), /redirect\('\/dashboard\/treasury'\)/);
  assert.match(read('app/dashboard/risk/page.tsx'), /redirect\('\/dashboard\/portfolio'\)/);
  assert.doesNotMatch(read('app/dashboard/reports/page.tsx'), /coming soon|unsupported|not supported/i);
});
