import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/site-header.tsx', import.meta.url), 'utf8');
const site = readFileSync(new URL('../lib/content/site.ts', import.meta.url), 'utf8');
const shell = `${page}\n${header}\n${site}`;

test('first viewport uses the approved proposition and announcement', () => {
  assert.match(page, /Own across markets\.[\s\S]*?<br \/>[\s\S]*?Operate as one portfolio\./);
  assert.match(page, /Introducing Capital Account/);
  assert.match(page, /One governed account infrastructure for modern capital\./);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('navigation exposes accessible desktop and mobile controls', () => {
  assert.match(header, /aria-expanded=/);
  assert.match(header, /aria-controls=/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key === 'Escape'/);
  assert.match(header, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(header, /mobileTrigger\.current\?\.focus\(\)/);
});

test('all calls to action use real destinations', () => {
  assert.doesNotMatch(shell, /href=["']#["']/);
  assert.match(site, /https:\/\/app\.neptlium\.com\/auth\/sign-in/);
  assert.match(site, /NEXT_PUBLIC_APP_URL/);
});

test('first-view marketing avoids unsupported financial presentation', () => {
  assert.doesNotMatch(shell, /Coinbase/i);
  assert.doesNotMatch(page, /\$[0-9]|[0-9]+\.[0-9]+%/);
  assert.doesNotMatch(page, /guaranteed returns?/i);
});

test('Modern Ownership presents four governed capital environments', () => {
  assert.match(page, /From Bitcoin to the companies shaping the future\./);
  for (const environment of [
    'Digital assets',
    'Public markets',
    'Tokenized opportunities',
    'Reserve assets',
  ]) {
    assert.match(page, new RegExp(`name: '${environment}'`));
  }
  assert.equal(
    (
      page.match(
        /name: '(Digital assets|Public markets|Tokenized opportunities|Reserve assets)'/g,
      ) ?? []
    ).length,
    4,
  );
  assert.match(
    page,
    /Product availability varies by jurisdiction, investor eligibility, account type,[\s\S]*supported asset, network and provider coverage\./,
  );
  assert.doesNotMatch(page, /\$[0-9]|[+-]?[0-9]+(?:\.[0-9]+)?%|returns?\s*:/i);
});

test('product environment exposes six linked systems and a real CTA', () => {
  for (const product of [
    'Overview',
    'Portfolio',
    'Capital Universe',
    'Allocation',
    'Capital Account',
    'Treasury',
  ]) {
    assert.match(page, new RegExp(`name: '${product}'`));
  }
  assert.equal((page.match(/className={`product-node/g) ?? []).length, 1);
  assert.match(page, /className="button" href="\/platform"/);
  assert.doesNotMatch(page, /href=["']#["']/);
});

test('homepage keeps semantic stage structure and one H1', () => {
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.equal((page.match(/<section/g) ?? []).length, 7);
  assert.match(page, /<section className="modern-ownership" aria-labelledby=/);
  assert.match(page, /<section className="product-environment" aria-labelledby=/);
  assert.doesNotMatch(shell, /Coinbase|CDP/i);
});

test('Portfolio Intelligence uses the canonical narrative and a real CTA', () => {
  assert.match(page, /See capital as a system—not a collection of positions\./);
  assert.match(
    page,
    /Neptlium connects holdings, performance, liquidity, concentration, exposure and[\s\S]*capital activity into one coherent operating view\./,
  );
  assert.match(
    page,
    /<Link className="button" href="\/platform">[\s\S]*Explore Portfolio Intelligence/,
  );
  assert.match(page, /<section className="portfolio-intelligence" aria-labelledby=/);
});

test('Portfolio Intelligence represents all required analytical dimensions', () => {
  for (const dimension of [
    'Total portfolio value',
    'Net allocation return',
    'Asset contribution',
    'Liquidity position',
    'Concentration',
    'Exposure',
    'Realized performance',
    'Unrealized performance',
    'Capital activity',
    'Portfolio role',
  ]) {
    assert.match(page, new RegExp(`'${dimension}'`));
  }
  assert.match(page, /Executive layer/);
  assert.match(page, /Analysis layer/);
  assert.match(page, /Operating layer/);
});

test('Portfolio Intelligence avoids fabricated trading evidence', () => {
  assert.doesNotMatch(page, /\$\s*[0-9]|[+-]?[0-9]+(?:\.[0-9]+)?%/);
  assert.doesNotMatch(page, /candlestick|market ticker|buy order|sell order|price tile/i);
  assert.doesNotMatch(page, /href=["']#["']/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(shell, /Coinbase|CDP/i);
});

test('Capital Account uses the canonical narrative, disclosure and real CTA', () => {
  assert.match(page, /One account for the movement of capital\./);
  assert.match(
    page,
    /Capital Account provides the operational foundation through which eligible users[\s\S]*can fund, hold, transfer and deploy supported capital across the Neptlium[\s\S]*environment\./,
  );
  assert.match(
    page,
    /Capital Account connects capital availability with portfolio decisions—without[\s\S]*reducing ownership to a trading balance\./,
  );
  assert.match(
    page,
    /Supported assets, networks and account capabilities may vary by jurisdiction,[\s\S]*eligibility, provider coverage and account type\./,
  );
  assert.match(page, /Explore Capital Account/);
  assert.match(page, /<Link className="button" href="\/platform">/);
});

test('Capital Account represents the complete governed operating model', () => {
  for (const responsibility of [
    'Deposit capital',
    'Maintain available balances',
    'Track pending capital',
    'Transfer supported assets',
    'Authorize allocations',
    'Receive distributions',
    'Withdraw available capital',
    'Review complete account activity',
  ]) {
    assert.match(page, new RegExp(`'${responsibility}'`));
  }
  for (const step of ['Fund', 'Organize', 'Authorize', 'Deploy', 'Review']) {
    assert.match(page, new RegExp(`\\['${step}',`));
  }
  assert.match(page, /Capital position/);
  assert.match(page, /Capital movement/);
  assert.match(page, /Capital control/);
});

test('Capital Account avoids fabricated account and custody evidence', () => {
  assert.doesNotMatch(page, /\$\s*[0-9]|(?:balance|volume|fee):\s*[0-9]/i);
  assert.doesNotMatch(page, /0x[a-f0-9]{8,}|transaction hash|deposit address|account number/i);
  assert.doesNotMatch(page, /QR code|Trust Wallet|custody (?:guarantee|insured|certified)/i);
  assert.doesNotMatch(page, /Coinbase|CDP/i);
  assert.doesNotMatch(page, /href=["']#["']/);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
});

test('Allocation uses canonical decision copy and real destination', () => {
  assert.match(page, /Model the decision before you move the capital\./);
  assert.match(
    page,
    /Build and compare allocation scenarios across assets, classifications and[\s\S]*strategies before authorizing execution\./,
  );
  assert.match(
    page,
    /Modeling does not move capital\. Execution requires explicit authorization\./,
  );
  assert.match(page, /Explore Allocation/);
  assert.match(page, /<Link className="button" href="\/platform">/);
});

test('Allocation represents Observe, Model and Authorize with exact descriptions', () => {
  for (const stage of ['Observe', 'Model', 'Authorize']) {
    assert.match(page, new RegExp(`name: '${stage}'`));
  }
  assert.match(
    page,
    /Review holdings, liquidity, concentration, performance and exposure through connected portfolio intelligence\./,
  );
  assert.match(
    page,
    /Compare possible allocations, projected portfolio structure, liquidity effects and concentration without moving capital\./,
  );
  assert.match(
    page,
    /Review the proposed allocation and authorize execution through defined identity, security and approval controls\./,
  );
  for (const control of [
    'Identity verified',
    'Policy reviewed',
    'Liquidity considered',
    'Exposure reviewed',
    'Approval required',
    'Execution explicit',
  ]) {
    assert.match(page, new RegExp(`'${control}'`));
  }
});

test('Capital classifications defines five mandate roles and a real CTA', () => {
  assert.match(page, /Give every allocation a purpose\./);
  const classifications = [
    ['Reserve', 'Capital maintained for liquidity, obligations and future opportunities.'],
    ['Core', 'Long-term foundational exposure to established assets and durable ownership.'],
    [
      'Growth',
      'Capital positioned toward expanding industries, networks and economic infrastructure.',
    ],
    ['Opportunity', 'Controlled exposure to higher-risk or time-sensitive opportunities.'],
    ['Restricted', 'Assets requiring additional eligibility, review or authorization.'],
  ];
  for (const [name, description] of classifications) {
    assert.match(page, new RegExp(`name: '${name}'`));
    assert.ok(page.includes(description));
  }
  assert.match(page, /Build your allocation framework/);
  assert.doesNotMatch(page, /href=["']#["']/);
});

test('Stage 5 avoids fabricated outcomes and automated advice claims', () => {
  assert.doesNotMatch(page, /\$\s*[0-9]|[+-]?[0-9]+(?:\.[0-9]+)?%/);
  assert.doesNotMatch(page, /buy button|sell button|order book|candlestick|risk score/i);
  assert.doesNotMatch(page, /robo-advice|automated advice|guaranteed optimization/i);
  assert.equal((page.match(/<h1/g) ?? []).length, 1);
  assert.doesNotMatch(page, /href=["']#["']/);
  assert.doesNotMatch(shell, /Coinbase|CDP/i);
});
