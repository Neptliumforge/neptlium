import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const webFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('public site consumes shared tokens and the production marketing authority', async () => {
  const [globals, production, brand] = await Promise.all([
    webFile('app/globals.css'),
    webFile('app/marketing-production.css'),
    readFile(new URL('../../../packages/ui/src/styles/brand.css', import.meta.url), 'utf8'),
  ]);
  assert.equal(globals.includes('packages/ui/src/styles/tokens.css'), true);
  assert.equal(production.includes("@import '../../../packages/ui/src/styles/brand.css';"), true);
  assert.equal(production.includes('--np-paper: var(--n-brand-canvas)'), true);
  assert.equal(production.includes('--np-ink: var(--n-brand-ink)'), true);
  assert.equal(production.includes('--np-blue: var(--n-brand-blue)'), true);
  assert.equal(brand.includes('--n-brand-blue: #0141f3'), true);
  assert.equal(production.includes('#2764ff'), false);
  assert.equal(production.includes('#147dff'), false);
  assert.equal(production.includes('radial-gradient'), false);
});

test('public brand consumes the shared production mark and canonical marketing blue', async () => {
  const [brand, icon] = await Promise.all([
    webFile('components/brand.tsx'),
    readFile(new URL('../public/icon.svg', import.meta.url), 'utf8'),
  ]);
  assert.equal(brand.includes('NeptliumMark'), true);
  assert.equal(brand.includes('next/image'), false);
  assert.equal(icon.includes('#0141F3'), true);
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

test('capital universe distinguishes current digital assets from future listed markets', async () => {
  const universe = await webFile('app/capital-universe/page.tsx');
  assert.equal(universe.includes('Digital assets'), true);
  assert.equal(universe.includes('Listed markets'), true);
  assert.equal(universe.includes('Future architecture'), true);
  assert.equal(universe.includes('No brokerage, stock-trading'), true);
  assert.equal(universe.includes('Neptlium is crypto-only'), false);
});
