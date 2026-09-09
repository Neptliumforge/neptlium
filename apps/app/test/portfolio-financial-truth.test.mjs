import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

const portfolio = read('app/dashboard/portfolio/page.tsx');
const portfolioComponents = read('components/product/PortfolioIntelligence.tsx');
const portfolioSurface = `${portfolio}\n${portfolioComponents}`;
const productState = read('components/product/ProductState.tsx');
const financial = read('lib/api/financial.ts');

test('Portfolio consumes canonical balances as financial position evidence', () => {
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
  assert.equal(portfolio.includes('getPortfolioState'), true);
  assert.equal(portfolioComponents.includes('Neptlium canonical ledger'), true);
  assert.equal(financial.includes('readonly available_atomic: string;'), true);
  assert.equal(financial.includes('readonly pending_atomic: string;'), true);
  assert.equal(financial.includes('readonly reserved_atomic: string;'), true);
});

test('Portfolio never manufactures zero from missing canonical evidence', () => {
  for (const field of ['available_atomic', 'pending_atomic', 'reserved_atomic']) {
    assert.equal(
      portfolio.includes(`?.${field} ?? '0'`),
      false,
      `${field} still contains an unknown-to-zero fallback`,
    );

    assert.equal(
      portfolio.includes(`?.${field} || '0'`),
      false,
      `${field} still contains a falsy unknown-to-zero fallback`,
    );
  }

  assert.equal(
    productState.includes('if (valueAtomic === undefined || valueAtomic === null || !asset)'),
    true,
  );
});

test('confirmed canonical zero and non-zero values remain numeric evidence', () => {
  assert.equal(productState.includes('formatAtomicAmount(valueAtomic, asset, decimals ?? undefined)'), true);

  assert.equal(productState.includes('const digits = negative ? value.slice(1) : value;'), true);

  assert.equal(
    productState.includes("const whole = decimals ? padded.slice(0, -decimals) || '0' : padded;"),
    true,
  );
});

test('funding capability cannot manufacture a Portfolio holding', () => {
  assert.equal(portfolio.includes('getFundingCapabilities'), false);
  assert.equal(portfolio.includes('getCanonicalBalances'), true);

  assert.equal(
    /valueAtomic=\{[^}]*provider/i.test(portfolio),
    false,
    'Provider-derived values must never populate canonical Portfolio values',
  );

  assert.equal(
    /source:\s*['"]NEPTLIUM_CANONICAL_LEDGER['"]/i.test(portfolio),
    false,
    'Portfolio must consume canonical API evidence rather than manufacture a source claim',
  );
});

test('Portfolio distinguishes canonical empty state from API failure', () => {
  assert.equal(
    portfolioComponents.includes('No portfolio positions available.'),
    true,
    'Successful canonical emptiness must remain an explicit non-actionable state',
  );

  assert.equal(
    portfolio.includes('Unavailable'),
    true,
    'Failed canonical loading must remain unavailable rather than zero',
  );
});

test('Portfolio does not manufacture valuation, performance, or risk scores', () => {
  for (const forbidden of [
    '$0.00',
    '0.00%',
    'Total portfolio value',
    'Net worth',
    'Gain/loss',
    'ROI',
    'risk score',
    'prediction score',
    'volatility score',
    'market ticker',
    'candlestick',
  ]) {
    assert.equal(
      portfolioSurface.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `Portfolio contains forbidden manufactured financial presentation: ${forbidden}`,
    );
  }

  assert.equal(
    /valueAtomic=\{[^}]*provider/i.test(portfolio),
    false,
    'Provider-derived values must never populate Portfolio financial values',
  );

  assert.equal(
    portfolio.includes('Cross-asset concentration requires authoritative valuation evidence.'),
    true,
  );
  assert.match(
    portfolioComponents,
    /Assets are not\s+combined without authoritative valuation evidence\./,
  );
});

test('Portfolio holdings are source-backed and preserve explicit unknown states', () => {
  for (const column of ['Asset', 'Quantity', 'Source', 'Status']) {
    assert.equal(
      portfolioComponents.includes(`>${column}<`),
      true,
      `missing holdings column ${column}`,
    );
  }
  assert.equal(portfolioComponents.includes('Observed'), true);
  assert.equal(portfolioSurface.includes('Unavailable'), true);
  assert.equal(portfolioSurface.includes('Awaiting source'), true);
  assert.equal(
    portfolioComponents.includes('FinancialValue valueAtomic={balance.total_atomic}'),
    true,
  );
});

test('Portfolio Intelligence has no execution actions', () => {
  for (const forbidden of [
    '#deposit',
    'Fund capital',
    '>Deposit<',
    '>Withdraw<',
    '>Buy<',
    '>Sell<',
    '>Trade<',
    'Execute allocation',
  ]) {
    assert.equal(
      portfolioSurface.includes(forbidden),
      false,
      `Portfolio contains execution action ${forbidden}`,
    );
  }
});

test('Portfolio attention and context are evidence-bound rather than transaction-shaped', () => {
  assert.equal(portfolioComponents.includes('No portfolio items require attention.'), true);
  assert.equal(portfolioComponents.includes('Portfolio context'), true);
  assert.equal(portfolio.includes('allocationOutsidePolicy'), true);
  assert.equal(portfolio.includes('allocationReview'), true);
  assert.equal(portfolioSurface.includes('transaction feed'), false);
});

test('App remains provider-neutral for Stripe', () => {
  assert.equal(
    portfolioSurface.includes('api.stripe.com'),
    false,
    'Portfolio must never call Stripe directly',
  );

  assert.equal(
    portfolioSurface.includes('STRIPE_SECRET_KEY'),
    false,
    'Stripe credentials must never enter Portfolio',
  );
});
