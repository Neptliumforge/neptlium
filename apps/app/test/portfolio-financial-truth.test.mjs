import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');

const portfolio = read('app/dashboard/portfolio/page.tsx');
const productState = read('components/product/ProductState.tsx');
const financial = read('lib/api/financial.ts');

test('Portfolio consumes canonical balances as financial position evidence', () => {
  assert.equal(portfolio.includes('getCanonicalBalances'), true);
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
    productState.includes(
      'if (valueAtomic === undefined || valueAtomic === null || !asset)',
    ),
    true,
  );
});

test('confirmed canonical zero and non-zero values remain numeric evidence', () => {
  assert.equal(
    productState.includes('formatAtomicAmount(valueAtomic, asset)'),
    true,
  );

  assert.equal(
    productState.includes(
      "const digits = negative ? value.slice(1) : value;",
    ),
    true,
  );

  assert.equal(
    productState.includes(
      "const whole = precision ? padded.slice(0, -precision) || '0' : padded;",
    ),
    true,
  );
});

test('governed capability cannot manufacture a Portfolio holding', () => {
  assert.equal(portfolio.includes('getFundingCapabilities'), true);
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
    portfolio.includes('0 positions'),
    true,
    'Successful canonical emptiness must permit an intentional zero-position state',
  );

  assert.equal(
    portfolio.includes('Unavailable'),
    true,
    'Failed canonical loading must remain unavailable rather than zero',
  );
});

test('Portfolio does not manufacture valuation or performance', () => {
  assert.equal(
    portfolio.includes('Performance'),
    true,
    'Portfolio must expose performance state explicitly',
  );

  assert.equal(
    portfolio.includes('Not established'),
    true,
    'Performance must remain unestablished without authoritative evidence',
  );

  assert.equal(
    portfolio.includes('Valuation'),
    true,
    'Portfolio must expose valuation state explicitly',
  );

  assert.equal(
    portfolio.includes('Single denomination') || portfolio.includes('No positions'),
    true,
    'Valuation must remain evidence-bound rather than synthesized',
  );

  for (const forbidden of [
    '$0.00',
    '0.00%',
    'market ticker',
    'candlestick',
  ]) {
    assert.equal(
      portfolio.toLowerCase().includes(forbidden.toLowerCase()),
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
    portfolio.includes(
      'Provider balances and unsupported market prices are never promoted into portfolio performance.',
    ),
    true,
    'Portfolio must explicitly preserve provider observation != canonical performance',
  );
});

test('App remains provider-neutral for Stripe', () => {
  assert.equal(
    portfolio.includes('api.stripe.com'),
    false,
    'Portfolio must never call Stripe directly',
  );

  assert.equal(
    portfolio.includes('STRIPE_SECRET_KEY'),
    false,
    'Stripe credentials must never enter Portfolio',
  );
});
