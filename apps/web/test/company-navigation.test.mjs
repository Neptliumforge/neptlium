import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('company navigation stays minimal while press remains a supporting route', () => {
  assert.match(architecture, /export const PRIMARY_COMPANY = COMPANY;/);
  assert.match(architecture, /label: 'Company', href: '\/company'/);
  assert.match(architecture, /label: 'Contact', href: '\/contact'/);
  assert.match(architecture, /'\/press': 'public-supporting-noindex'/);
});
