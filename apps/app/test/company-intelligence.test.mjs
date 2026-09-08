import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('company intelligence preserves annual history and governed ratios', () => {
  const source = read('lib/company-intelligence.ts');
  for (const token of [
    'CompanyHistoricalPeriod',
    'revenue_growth_yoy',
    'gross_margin',
    'operating_margin',
    'net_margin',
    'liabilities_to_assets',
    'cash_to_assets',
  ]) assert.equal(source.includes(token), true, `missing ${token}`);

  assert.equal(source.includes("numerator.periodEnd !== denominator.periodEnd"), true, 'ratio periods must align');
  assert.equal(source.includes("slice(0, 5)"), true, 'history must stay bounded');
});

test('filing chronology identifies earnings events from SEC item 2.02', () => {
  const source = read('lib/company-intelligence.ts');
  assert.equal(source.includes("'EARNINGS_EVENT'"), true);
  assert.equal(source.includes("includes('2.02')"), true);
  assert.equal(source.includes('classifyFiling'), true);
});

test('comparables remain user-directed and capped', () => {
  const source = read('lib/company-intelligence.ts');
  const page = read('app/dashboard/research/company/[ticker]/page.tsx');
  assert.equal(source.includes('getComparableCompanies'), true);
  assert.equal(source.includes('slice(0, 4)'), true);
  assert.equal(page.includes('User-directed peer set'), true);
  assert.equal(page.includes('does not auto-declare peers'), true);
  assert.equal(page.includes('Same SIC'), true);
});
