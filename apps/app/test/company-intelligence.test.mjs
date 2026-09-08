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
  ])
    assert.equal(source.includes(token), true, `missing ${token}`);

  assert.equal(
    source.includes('numerator.periodEnd !== denominator.periodEnd'),
    true,
    'ratio periods must align',
  );
  assert.equal(source.includes('slice(0, 5)'), true, 'history must stay bounded');
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

test('Company Intelligence presents verified understanding rather than a research console', () => {
  const landing = read('app/dashboard/research/page.tsx');
  const company = read('app/dashboard/research/company/[ticker]/page.tsx');
  const canonical = read('app/dashboard/company-intelligence/page.tsx');
  const navigation = read('components/navigation/dashboardNav.tsx');
  const surface = `${landing}\n${company}`;

  assert.equal(canonical.includes("from '../research/page'"), true);
  assert.equal(navigation.includes("href: '/dashboard/company-intelligence'"), true);
  assert.equal(
    landing.includes(
      'Understand companies through verified identity, financial evidence, and primary sources.',
    ),
    true,
  );
  assert.equal(landing.includes('Begin with a company.'), true);
  assert.equal(landing.includes('Resolve Company'), true);
  for (const section of [
    'Company Identity',
    'Financial Understanding',
    'Evidence Library',
    'Company Timeline',
    'Intelligence Foundation',
  ]) {
    assert.equal(surface.includes(section), true, `missing ${section}`);
  }
});

test('Company Intelligence retains primary SEC evidence without market or advisory presentation', () => {
  const source = read('lib/company-intelligence.ts');
  const landing = read('app/dashboard/research/page.tsx');
  const company = read('app/dashboard/research/company/[ticker]/page.tsx');
  const surface = `${landing}\n${company}`;

  assert.equal(source.includes("authority: 'SEC'"), true);
  assert.equal(source.includes('data.sec.gov'), true);
  assert.equal(source.includes('companyfacts'), true);
  assert.equal(company.includes('View filing'), true);
  assert.equal(company.includes('Verified primary filing'), true);
  for (const forbidden of [
    'price prediction',
    'analyst rating',
    'Buy rating',
    'Sell rating',
    'price target',
    'stock chart',
  ]) {
    assert.equal(
      surface.toLowerCase().includes(forbidden.toLowerCase()),
      false,
      `contains ${forbidden}`,
    );
  }
});
