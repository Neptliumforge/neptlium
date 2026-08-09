import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const webFile = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('public site imports the shared Neptlium token family and offline typography', async () => {
  const css = await webFile('app/globals.css');
  assert.equal(css.includes('packages/ui/src/styles/tokens.css'), true);
  assert.equal(css.includes('--color-accent-primary'), true);
  assert.equal(css.includes('next/font/google'), false);
  assert.equal(css.includes('fonts.googleapis.com'), false);
  assert.equal(css.includes('--cyan'), false);
});

test('public brand and auth entry use canonical assets and routes', async () => {
  const [brand, icon, site] = await Promise.all([
    webFile('components/brand.tsx'),
    readFile(new URL('../public/icon.svg', import.meta.url), 'utf8'),
    webFile('lib/content/site.ts'),
  ]);
  assert.equal(brand.includes('linearGradient'), false);
  assert.equal(icon.includes('linearGradient'), true);
  assert.equal(site.includes('https://app.neptlium.com/auth/sign-up'), true);
  assert.equal(site.includes('https://app.neptlium.com/auth/sign-in'), true);
});

test('public product language keeps Capital Account and truthful availability', async () => {
  const [home, stage] = await Promise.all([
    webFile('app/page.tsx'),
    webFile('components/product-stage.tsx'),
  ]);
  const source = `${home}\n${stage}`;
  assert.equal(source.includes('Neptlium Wallet'), false);
  assert.equal(source.includes('coming soon'), false);
  assert.equal(source.includes('Capital Account'), true);
  assert.equal(source.includes('Provider not configured'), false);
  assert.equal(source.includes('Backend required'), false);
  assert.equal(source.includes('Database-backed'), false);
  assert.equal(source.includes('href="#"'), false);
});

test('recognized capital uses the governed shared identity system', async () => {
  const [home, universe, registry] = await Promise.all([
    webFile('app/page.tsx'),
    webFile('app/capital-universe/page.tsx'),
    readFile(new URL('../../../packages/ui/src/components/Identity.tsx', import.meta.url), 'utf8'),
  ]);
  assert.equal(home.includes('AssetIdentity'), true);
  assert.equal(universe.includes('AssetIdentity'), true);
  for (const identity of ['bitcoin', 'ethereum', 'usdc', 'base']) {
    assert.equal(registry.includes(`${identity}:`), true);
  }
});

test('public product visuals show structure without fabricated financial state', async () => {
  const visuals = await webFile('components/product-visuals.tsx');
  for (const visual of [
    'CapitalSystemVisual',
    'PortfolioVisual',
    'CapitalAccountVisual',
    'TreasuryVisual',
    'AllocationVisual',
    'OperatingModelVisual',
    'SecurityFlowVisual',
  ]) {
    assert.equal(visuals.includes(`function ${visual}`), true);
  }
  assert.equal(visuals.includes('AssetIdentity'), true);
  assert.equal(visuals.includes('Modeling does not move capital.'), true);
  assert.equal(/\$[0-9]|\+[0-9]+(?:\.[0-9]+)?%/.test(visuals), false);
});
