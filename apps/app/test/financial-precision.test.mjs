import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const source = read('components/product/ProductState.tsx');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const module = { exports: {} };
// Only Badge is isolated; execute the actual FinancialValue and formatter with React.
new Function('require', 'module', 'exports', compiled)((name) => name === '@neptlium/ui' ? { Badge: () => null } : require(name), module, module.exports);
const { FinancialValue, formatAtomicAmount } = module.exports;
const display = (props) => renderToStaticMarkup(FinancialValue(props));

test('financial formatter preserves backend precision, zero, USD/USDC identity and large exact quantities', () => {
  assert.equal(formatAtomicAmount('0', 'USD', 2), '0 USD');
  assert.equal(formatAtomicAmount('1234567', 'USDC', 6), '1.234567 USDC');
  assert.equal(formatAtomicAmount('1234567', 'USD', 2), '12,345.67 USD');
  assert.equal(formatAtomicAmount('900719925474099312345', 'BTC', 8), '9,007,199,254,740.99312345 BTC');
  assert.equal(formatAtomicAmount('-123', 'USD', 2), '-1.23 USD');
  assert.equal(formatAtomicAmount('12', 'ANY', 0), '12 ANY');
  // Deliberately unusual precision proves that the asset symbol does not override the API.
  assert.equal(formatAtomicAmount('12345', 'USDC', 3), '12.345 USDC');
  assert.match(display({ valueAtomic: '0', asset: 'USDC', decimals: 6 }), />0 USDC</);
});

test('missing evidence stays unavailable and missing precision is never guessed', () => {
  for (const valueAtomic of [undefined, null]) {
    assert.match(display({ valueAtomic, asset: 'USD', decimals: 2 }), />Unavailable</);
  }
  for (const decimals of [undefined, null, -1, 1.5]) {
    assert.match(display({ valueAtomic: '123', asset: 'USD', decimals }), />123 atomic USD</);
  }
});

test('every canonical financial display passes precision from the same amount record', () => {
  const files = [
    'app/dashboard/capital-account/CapitalAccountView.tsx',
    'app/dashboard/treasury/TreasuryView.tsx',
    'app/dashboard/transactions/page.tsx',
    'components/product/PortfolioIntelligence.tsx',
    'components/product/CapitalPosition.tsx',
    'components/product/AllocationIntelligence.tsx',
  ];
  for (const file of files) {
    const contents = read(file);
    const tags = [...contents.matchAll(/<FinancialValue\b[^>]*?\/>/gs)];
    assert.ok(tags.length, file);
    for (const [tag] of tags) {
      const record = tag.match(/valueAtomic=\{(\w+)\./)?.[1];
      assert.ok(record, `${file}: financial amount record required`);
      assert.ok(tag.includes(`decimals={${record}.decimals}`), `${file}: missing precision on ${tag}`);
    }
  }
  assert.equal((read('app/dashboard/transactions/page.tsx').match(/decimals: item.decimals/g) ?? []).length, 2);
  assert.match(read('components/product/CapitalPosition.tsx'), /decimals: balance.decimals/);
  assert.doesNotMatch(source, /(?:USD|USDC|BTC|ETH)\s*:\s*\d/);
  const contract = read('lib/api/financial.ts');
  assert.equal((contract.match(/readonly decimals: number \| null;/g) ?? []).length, 4);
  assert.equal((contract.match(/readonly atomicPrecision: number \| null;/g) ?? []).length, 4);
});
