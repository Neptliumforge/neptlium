import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  availabilityPresentation,
  formatBasisPoints,
  formatMinorAmount,
  groupByFamily,
  termsSummary,
} from '../components/invest/catalog-presentation.ts';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');
const catalogView = read('components/invest/InvestCatalogView.tsx');
const detailView = read('components/invest/InvestProductDetail.tsx');
const catalogPage = read('app/dashboard/invest/page.tsx');
const detailPage = read('app/dashboard/invest/[slug]/page.tsx');
const investSources = [
  ...readdirSync(join(appRoot, 'components/invest')).map((file) => read(`components/invest/${file}`)),
  catalogPage,
  detailPage,
  read('app/dashboard/invest/loading.tsx'),
  read('lib/api/invest.ts'),
];

test('concepts and research collections are never presented as available to invest', () => {
  assert.equal(availabilityPresentation.CONCEPT.detail, 'Not available to invest');
  assert.equal(availabilityPresentation.RESEARCH_ONLY.detail, 'Not an investment product');
  assert.match(catalogView, /Investing is not available yet\./);
  assert.match(detailView, /Investing in this product is not available\. There is nothing to buy or allocate here\./);
});

test('Invest offers no buy, allocate or return-promise actions', () => {
  for (const source of investSources) {
    assert.doesNotMatch(source, />\s*(Invest now|Buy|Allocate|Start investing)\s*</i);
    assert.doesNotMatch(source, /guarantee|expected return|projected return(?! or hypothetical)|3\.7/i);
  }
  assert.match(detailView, /does not show projected or hypothetical returns/);
});

test('proposed terms are formatted exactly and labelled as not final', () => {
  assert.equal(formatMinorAmount('30000', 'USD'), '$300');
  assert.equal(formatMinorAmount('1000000', 'USD'), '$10,000');
  assert.equal(formatMinorAmount('12345', 'USD'), '$123.45');
  assert.equal(formatMinorAmount('5', 'USD'), '$0.05');
  assert.equal(formatMinorAmount(null, 'USD'), null);
  assert.equal(formatMinorAmount('1e3', 'USD'), null);
  assert.equal(formatMinorAmount('100', 'XYZ'), null);
  assert.equal(
    termsSummary({ status: 'PROPOSED', currency: 'USD', minimum_minor: '30000', maximum_minor: '1000000', fee_note: null, liquidity_note: null }),
    'Proposed minimum $300 · Proposed maximum $10,000',
  );
  assert.equal(termsSummary(null), null);
  assert.match(catalogView, /\{terms\} · not final/);
  assert.match(detailView, /Proposed terms are planning assumptions and are not final\./);
});

test('published figures render exactly from basis points', () => {
  assert.equal(formatBasisPoints(512), '5.12%');
  assert.equal(formatBasisPoints(-5), '−0.05%');
  assert.equal(formatBasisPoints(0), '0.00%');
});

test('featured catalog groups plans before research collections', () => {
  const item = (slug, family) => ({ slug, family });
  assert.deepEqual(
    groupByFamily([item('ai', 'THEMATIC_COLLECTION'), item('reserve', 'MANAGED_PLAN')]).map((g) => g.family),
    ['MANAGED_PLAN', 'THEMATIC_COLLECTION'],
  );
});

test('catalog states are explicit: loading, empty, no-match, unavailable and not found', () => {
  assert.match(read('app/dashboard/invest/loading.tsx'), /aria-busy="true"/);
  assert.match(catalogView, /The catalog is being prepared/);
  assert.match(catalogView, /No products match/);
  assert.match(catalogView, /The catalog is temporarily unavailable/);
  assert.match(catalogPage, /<InvestUnavailable/);
  assert.match(detailPage, /status === 404\) notFound\(\)/);
  assert.match(read('app/dashboard/invest/[slug]/not-found.tsx'), /This product is not in the catalog/);
});

test('search and filters are an accessible, script-free GET form', () => {
  assert.match(catalogView, /method="get" role="search"/);
  for (const name of ['q', 'family', 'availability', 'sector', 'sort'])
    assert.match(catalogView, new RegExp(`name="${name}"`));
  assert.equal((catalogView.match(/<label className="invest-field/g) ?? []).length, 5);
  assert.doesNotMatch([catalogView, detailView].join('\n'), /^'use client'/m);
});

test('session expiry and invalid filters fail safely', () => {
  assert.match(catalogPage, /status === 401\)\s+redirect\('\/auth\/sign-in\?next=%2Fdashboard%2Finvest'\)/);
  assert.match(catalogPage, /status === 422\) redirect\('\/dashboard\/invest'\)/);
  assert.match(detailPage, /\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$/);
});

test('product pages are supported return destinations; malformed slugs are not', async () => {
  const { safeInternalPath } = await import('../app/(auth)/auth-utils.ts');
  assert.equal(safeInternalPath('/dashboard/invest/reserve'), '/dashboard/invest/reserve');
  assert.equal(safeInternalPath('/dashboard/invest/ai-compute'), '/dashboard/invest/ai-compute');
  for (const value of ['/dashboard/invest/Reserve', '/dashboard/invest/reserve/extra', '/dashboard/invest/a--b', '/dashboard/invest/%2e%2e'])
    assert.equal(safeInternalPath(value), '/dashboard', value);
  assert.match(detailPage, /next=\$\{encodeURIComponent\(`\/dashboard\/invest\/\$\{slug\}`\)\}/);
});

test('Invest keeps company research, capital and portfolio discoverable', () => {
  const experience = read('components/product/OperatingExperience.tsx');
  const start = experience.indexOf('export function InvestExperience(');
  const shell = experience.slice(start, experience.indexOf('\nexport function ', start + 1));
  for (const href of ['/dashboard/companies', '/dashboard/capital', '/dashboard/portfolio'])
    assert.match(shell, new RegExp(`href="${href.replaceAll('/', '\\/')}"`));
  assert.equal((catalogPage.match(/<InvestExperience>/g) ?? []).length, 2);
});
