import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

const portfolioPage = read('app/dashboard/portfolio/page.tsx');
const experience = read('components/product/OperatingExperience.tsx');
const bootstrap = read('lib/product/bootstrap.ts');
const productState = read('components/product/ProductState.tsx');
const financial = read('lib/api/financial.ts');
const surface = `${portfolioPage}\n${experience}`;

test('Portfolio consumes canonical balances and portfolio state through the shared bootstrap', () => {
  assert.match(bootstrap, /getCanonicalBalances\(\)/);
  assert.match(bootstrap, /getPortfolioState\(\)/);
  assert.match(bootstrap, /canonical_balances_unavailable/);
  assert.match(bootstrap, /portfolio: projection\(portfolio\)/);
  assert.match(portfolioPage, /PortfolioExperience/);
  assert.match(financial, /readonly available_atomic: string;/);
  assert.match(financial, /readonly pending_atomic: string;/);
  assert.match(financial, /readonly reserved_atomic: string;/);
});

test('Portfolio never manufactures zero from missing canonical evidence', () => {
  for (const field of ['available_atomic', 'pending_atomic', 'reserved_atomic']) {
    assert.doesNotMatch(surface, new RegExp(`\\?\\.${field} \\?\\? ['\"]0['\"]`));
    assert.doesNotMatch(surface, new RegExp(`\\?\\.${field} \\|\\| ['\"]0['\"]`));
  }
  assert.match(productState, /if \(valueAtomic === undefined \|\| valueAtomic === null \|\| !asset\)/);
});

test('confirmed canonical zero and non-zero values remain numeric evidence', () => {
  assert.match(productState, /formatAtomicAmount\(valueAtomic, asset, decimals \?\? undefined\)/);
  assert.match(productState, /const digits = negative \? value\.slice\(1\) : value;/);
  assert.match(productState, /const whole = decimals \? padded\.slice\(0, -decimals\) \|\| '0' : padded;/);
});

test('funding capability cannot manufacture a Portfolio holding', () => {
  assert.doesNotMatch(portfolioPage, /getFundingCapabilities/);
  assert.doesNotMatch(experience, /valueAtomic=\{[^}]*provider/i);
  assert.doesNotMatch(surface, /api\.stripe\.com|STRIPE_SECRET_KEY|CIRCLE_API|ALCHEMY/i);
});

test('Portfolio distinguishes unavailable canonical state from authoritative absence', () => {
  assert.match(bootstrap, /state: 'UNAVAILABLE'/);
  assert.match(experience, /Canonical valuation unavailable/);
  assert.match(experience, /No canonical positions are available/);
  assert.match(experience, /Unknown allocation is not rendered as zero/);
  assert.match(experience, /Reconciled valuation history is not available/);
});

test('Portfolio does not manufacture valuation, performance, or risk scores', () => {
  for (const forbidden of [
    '$0.00', '0.00%', 'Net worth', 'Gain/loss', 'ROI', 'risk score', 'prediction score',
    'volatility score', 'market ticker', 'candlestick',
  ]) assert.doesNotMatch(surface, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  assert.match(experience, /Portfolio value<\/span><strong>—<\/strong>/);
  assert.match(experience, /No decorative or interpolated performance curve is rendered/);
});

test('Portfolio holdings remain absent until authoritative positions exist', () => {
  assert.match(experience, /No canonical positions are available/);
  assert.match(experience, /Quantity, price, cost basis and return stay absent until provided by the portfolio projection/);
  assert.doesNotMatch(surface, /sample holding|illustrative holding|mock position/i);
});

test('Portfolio has no execution actions', () => {
  for (const forbidden of ['#deposit', 'Fund capital', '>Deposit<', '>Withdraw<', '>Buy<', '>Sell<', '>Trade<', 'Execute allocation']) {
    assert.equal(surface.includes(forbidden), false, `Portfolio contains execution action ${forbidden}`);
  }
});

test('Portfolio preserves allocation as context rather than inferred financial truth', () => {
  assert.match(experience, /Portfolio composition/);
  assert.match(experience, /Position allocation unavailable/);
  assert.match(bootstrap, /getAllocationState\(\)/);
  assert.doesNotMatch(surface, /transaction feed/i);
});
