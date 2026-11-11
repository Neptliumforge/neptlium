import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const native = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(
    (name) => {
      if (name in mocks) return mocks[name];
      if (name.endsWith('.module.css'))
        return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
      return native(name);
    },
    module,
    module.exports,
  );
  return module.exports;
}
const catalog = load(resolve(root, '../api/src/investment-orders.ts'), {
  './errors.js': { ApiError: Error },
}).investmentOrderCatalog();
const link = ({ href, children, ...props }) =>
  React.createElement('a', { href, ...props }, children);
const primitives = {
  Badge: ({ children }) => React.createElement('span', {}, children),
  Button: ({ children, ...props }) => React.createElement('button', props, children),
};
const apiPath = resolve(root, 'lib/api/investment-orders.ts');
function api(value) {
  return load(apiPath, { 'server-only': {}, './client': { apiRequest: async () => value } });
}
const mocks = (value) => ({
  '@/lib/api/investment-orders': api(value),
  '@neptlium/ui': primitives,
  'next/link': { __esModule: true, default: link },
  'next/navigation': {
    notFound() {
      throw new Error('404');
    },
  },
});

test('listings render the server-owned five proposals with exact amounts and no purchase controls', async () => {
  const Page = load(resolve(root, 'app/dashboard/listings/page.tsx'), mocks(catalog)).default;
  const html = renderToStaticMarkup(await Page());
  for (const name of [
    'Entry Order',
    'Growth Order',
    'Advanced Order',
    'Executive Order',
    'Institutional Order',
  ])
    assert.ok(html.includes(name));
  for (const amount of ['$500', '$1,000', '$5,000', '$15,000', '$25,000'])
    assert.ok(html.includes(amount));
  assert.equal((html.match(/<article/g) ?? []).length, 5);
  assert.match(html, /No funds are being accepted/);
  assert.doesNotMatch(html, /<form|<button|buy\.stripe|checkout\.stripe|0x[a-f0-9]{40}/i);
});

test('details show pending disclosure requirements, disabled enrollment and a non-executable journey', async () => {
  const Page = load(
    resolve(root, 'app/dashboard/listings/[orderId]/page.tsx'),
    mocks(catalog),
  ).default;
  const html = renderToStaticMarkup(
    await Page({ params: Promise.resolve({ orderId: 'advanced' }) }),
  );
  assert.match(html, /Advanced Order/);
  assert.match(html, /4 months/);
  assert.match(html, /<button[^>]*disabled/);
  assert.match(html, /aria-describedby="enrollment-unavailable"/);
  assert.equal((html.match(/<li[ >]/g) ?? []).length, 8);
  assert.match(html, /payment confirmation would not establish enrollment or an earned return/);
  for (const requirement of catalog.requirements) assert.ok(html.includes(requirement));
  assert.doesNotMatch(html, /<form|payment_link|deposit_address/);
});

test('unapproved or malformed catalog cannot turn the prototype into a purchasable offer', async () => {
  for (const value of [
    { ...catalog, purchasable: true },
    { ...catalog, listings: [{ ...catalog.listings[0], returnTerms: '10%' }] },
    { ...catalog, listings: [{ ...catalog.listings[0], amountMinor: '1e5' }] },
  ]) {
    assert.equal(await api(value).loadProposedOrders(), null);
    const Page = load(resolve(root, 'app/dashboard/listings/page.tsx'), mocks(value)).default;
    assert.match(renderToStaticMarkup(await Page()), /Listings are temporarily unavailable/);
  }
});

test('listing composition uses canonical visual tokens, responsive layout and reduced motion', () => {
  const css = readFileSync(resolve(root, 'app/dashboard/listings/styles.module.css'), 'utf8');
  assert.match(css, /var\(--color-surface-1\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /focus-visible/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(/i);
});
