import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const webFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('public site consumes shared tokens and one canonical Web visual authority', async () => {
  const [globals, brand, visualDirection, layout] = await Promise.all([
    webFile('app/globals.css'),
    readFile(new URL('../../../packages/ui/src/styles/brand.css', import.meta.url), 'utf8'),
    webFile('app/neptlium-visual-direction.css'),
    webFile('app/layout.tsx'),
  ]);
  assert.equal(globals.includes('packages/ui/src/styles/tokens.css'), true);
  assert.equal(brand.includes('--n-brand-blue: #258be5'), true);
  assert.match(visualDirection, /--web-ivory:\s*#f5f3ee/);
  assert.match(visualDirection, /--web-carbon:\s*#101214/);
  assert.match(visualDirection, /--web-teal:\s*#0f8f86/);
  assert.equal(visualDirection.includes('#2764ff'), false);
  assert.equal(visualDirection.includes('#147dff'), false);
  assert.equal(visualDirection.includes('radial-gradient'), false);
  assert.equal(layout.includes("import './neptlium-visual-direction.css';"), true);
});

test('public brand delegates geometry to the shared production mark', async () => {
  const [brand, icon] = await Promise.all([
    webFile('components/brand.tsx'),
    readFile(new URL('../public/icon.svg', import.meta.url), 'utf8'),
  ]);
  assert.equal(brand.includes('NeptliumMark'), true);
  assert.equal(brand.includes("from '@neptlium/ui'"), true);
  assert.equal(brand.includes('<svg'), false);
  assert.equal(brand.includes('<path'), false);
  assert.equal(brand.includes('next/image'), false);
  assert.equal(icon.includes('#0F8F86'), true);
  assert.equal(icon.includes('#0141F3'), false);
  assert.equal(icon.includes('#2764FF'), false);
  assert.equal(icon.includes('linearGradient'), false);
});

test('public product visuals never format unavailable state as money', async () => {
  const visuals = await webFile('components/product-visuals.tsx');
  for (const visual of [
    'OperatingEnvironmentVisual',
    'CapitalSystemVisual',
    'PortfolioVisual',
    'CapitalAccountVisual',
    'TreasuryVisual',
    'TransferVisual',
    'AllocationVisual',
    'CapitalUniverseVisual',
    'ExecutionLifecycleVisual',
    'SecurityFlowVisual',
  ]) {
    assert.equal(visuals.includes(`function ${visual}`), true, `Missing ${visual}`);
  }
  assert.equal(visuals.includes('Unavailable'), true);
  assert.equal(visuals.includes('No capital activity yet'), true);
  assert.equal(visuals.includes('Modeling does not move capital.'), true);
  assert.equal(visuals.includes('Submission is not settlement.'), true);
  assert.equal(/\$[0-9]|\$—|0 USD|\+[0-9]+(?:\.[0-9]+)?%/.test(visuals), false);
});

test('Capital Universe is canonical strategic product context without asset-availability claims', async () => {
  const universe = await webFile('app/products/capital-universe/page.tsx');
  assert.equal(universe.includes("path: '/products/capital-universe'"), true);
  assert.equal(universe.includes('Classification is not availability.'), true);
  assert.equal(universe.includes('asset, network, custody, market or execution availability'), true);
  assert.match(universe, /provider|infrastructure/i);
  assert.equal(universe.includes('USDC'), false);
  assert.equal(universe.includes('BTC'), false);
  assert.equal(universe.includes('ETH'), false);
  assert.equal(universe.includes('Neptlium is crypto-only'), false);
});
