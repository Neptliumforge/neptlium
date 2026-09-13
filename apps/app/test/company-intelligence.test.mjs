import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('company intelligence preserves annual history and governed ratios', () => {
  const source = read('lib/company-intelligence.ts');
  for (const token of [
    'CompanyHistoricalPeriod', 'revenue_growth_yoy', 'gross_margin', 'operating_margin',
    'net_margin', 'liabilities_to_assets', 'cash_to_assets',
  ]) assert.equal(source.includes(token), true, `missing ${token}`);
  assert.match(source, /numerator\.periodEnd !== denominator\.periodEnd/);
  assert.match(source, /slice\(0, 5\)/);
});

test('filing chronology identifies earnings events from SEC item 2.02', () => {
  const source = read('lib/company-intelligence.ts');
  assert.match(source, /'EARNINGS_EVENT'/);
  assert.match(source, /includes\('2\.02'\)/);
  assert.match(source, /classifyFiling/);
});

test('comparables remain user-directed and capped', () => {
  const source = read('lib/company-intelligence.ts');
  const page = read('app/dashboard/research/company/[ticker]/page.tsx');
  assert.match(source, /getComparableCompanies/);
  assert.match(source, /slice\(0, 4\)/);
  assert.match(page, /User-directed peer set/);
  assert.match(page, /does not auto-declare peers/);
  assert.match(page, /Same SIC/);
});

test('Companies separates authenticated exposure from public company research', () => {
  const companiesPage = read('app/dashboard/companies/page.tsx');
  const records = read('components/product/RecordExperiences.tsx');
  const navigation = read('components/navigation/dashboardNav.tsx');
  const research = read('app/dashboard/research/page.tsx');

  assert.match(companiesPage, /CompaniesExperience/);
  assert.match(navigation, /label: 'Companies'/);
  assert.match(navigation, /href: '\/dashboard\/companies'/);
  assert.match(records, /No authenticated company exposure projection is available/);
  assert.match(records, /will not infer portfolio exposure from public market research/);
  assert.match(records, /Public company research remains separate from customer holdings/);
  assert.match(records, /href="\/dashboard\/research"/);
  assert.match(research, /Understand companies through verified identity, financial evidence, and primary sources/);
  assert.match(research, /Begin with a company/);
  assert.match(research, /Resolve Company/);
});

test('Company Intelligence retains primary SEC evidence without market or advisory presentation', () => {
  const source = read('lib/company-intelligence.ts');
  const landing = read('app/dashboard/research/page.tsx');
  const company = read('app/dashboard/research/company/[ticker]/page.tsx');
  const surface = `${landing}\n${company}`;

  assert.match(source, /authority: 'SEC'/);
  assert.match(source, /data\.sec\.gov/);
  assert.match(source, /companyfacts/);
  assert.match(company, /View filing/);
  assert.match(company, /Verified primary filing/);
  for (const forbidden of ['price prediction', 'analyst rating', 'Buy rating', 'Sell rating', 'price target', 'stock chart']) {
    assert.doesNotMatch(surface, new RegExp(forbidden, 'i'));
  }
});
