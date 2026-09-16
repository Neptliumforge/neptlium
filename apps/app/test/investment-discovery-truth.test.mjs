import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(appRoot, path), 'utf8');
const experience = read('components/product/OperatingExperience.tsx');
const invest = experience.slice(
  experience.indexOf('export function InvestExperience()'),
  experience.indexOf('export function MoreExperience()'),
);

test('Invest remains discovery rather than unsupported inventory', () => {
  assert.match(invest, /No investments are currently available/);
  assert.match(invest, /planned categories as current inventory/);
  for (const requirement of ['Strategy', 'Terms', 'Documents', 'Risks', 'Eligibility']) {
    assert.match(invest, new RegExp(`['"]${requirement}['"]`));
  }
  assert.doesNotMatch(
    invest,
    /Public Markets|Private Markets|Private Credit|Digital Assets|Real Assets/,
  );
});

test('research context cannot masquerade as an investment or recommendation', () => {
  assert.match(invest, /research context, not an offer, recommendation or portfolio\s+position/);
  assert.match(invest, /\/dashboard\/companies/);
  assert.match(invest, /\/dashboard\/portfolio/);
  assert.doesNotMatch(invest, />Invest now<|>Buy<|>Allocate<|guaranteed return/i);
});
