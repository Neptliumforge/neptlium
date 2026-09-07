import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const productRoutes = [
  'app/products/capital-account/page.tsx',
  'app/products/treasury/page.tsx',
  'app/products/allocation/page.tsx',
  'app/products/portfolio-intelligence/page.tsx',
  'app/products/performance/page.tsx',
  'app/products/capital-universe/page.tsx',
];

test('product detail routes explain responsibility without assuming provider authority', () => {
  const copy = productRoutes.map(read).join('\n');
  for (const phrase of ['Capital Account','Treasury','Allocation','Portfolio Intelligence','Performance','Capital Universe']) assert.match(copy, new RegExp(phrase, 'i'));
  assert.doesNotMatch(copy, /Neptlium (?:holds|custodies|brokers|settles|executes|invests|manages) (?:your|customer|client) (?:cash|assets|money|securities|funds)/i);
});

test('security copy does not invent certification or infrastructure controls', () => {
  const security = read('app/security/page.tsx');
  assert.doesNotMatch(security, /SOC\s*2|ISO\s*27001|HSM|penetration test|AES-256|military-grade|zero-trust certified/i);
});

test('trust copy keeps modeled and authoritative information distinct', () => {
  const trust = read('app/trust/page.tsx');
  assert.match(trust, /modeled/i);
  assert.match(trust, /authoritative|authority/i);
  assert.match(trust, /evidence|provider/i);
});
