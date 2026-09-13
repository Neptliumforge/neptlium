import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('dashboard renders shared API-backed state instead of illustrative financial values', () => {
  const dashboard = read('app/dashboard/page.tsx');
  const experience = read('components/product/OperatingExperience.tsx');
  const bootstrap = read('lib/product/bootstrap.ts');
  assert.match(dashboard, /OverviewExperience/);
  assert.match(bootstrap, /getOverviewState/);
  assert.match(bootstrap, /getCanonicalBalances/);
  assert.match(experience, /Recent account events/);
  assert.match(experience, /Total canonical capital/);
  assert.doesNotMatch(experience, /Public markets|Private companies|Company position updated|36%|28%/);
});

test('deposit route is a dedicated funding-method experience', () => {
  const deposit = read('app/dashboard/deposit/page.tsx');
  assert.match(deposit, /\/dashboard\/deposit\/crypto/);
  assert.match(deposit, /Deposit digital assets/);
  assert.match(deposit, /Stripe capital funding pending/);
  assert.doesNotMatch(deposit, /redirect\('/);
});

test('crypto deposit creates instructions through the governed funding action', () => {
  const flow = read('app/dashboard/deposit/crypto/CryptoDepositFlow.tsx');
  assert.match(flow, /createFundingIntentAction/);
  assert.match(flow, /deposit_address/);
  assert.match(flow, /Balance credit occurs only after Neptlium verifies observation, posting, settlement, and reconciliation/);
  assert.doesNotMatch(flow, /https?:\/\/.*qr/i);
});
