import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const repo = resolve(import.meta.dirname, '../../..');
const read = (path) => readFileSync(resolve(repo, path), 'utf8');

test('runtime provider surface is limited to Circle, Alchemy, and Stripe evidence', () => {
  const app = read('apps/api/src/app.ts');
  const config = read('apps/api/src/config.ts');
  const financial = read('apps/api/src/financial-routes.ts');
  const registry = read('apps/api/src/asset-registry.ts');
  const runtime = `${app}\n${config}\n${financial}\n${registry}`;

  assert.match(app, /circle: capitalProvider\.readiness\(\)/);
  assert.match(app, /configured_observation_only/);
  assert.match(app, /configured_webhook_evidence_only/);
  assert.doesNotMatch(runtime, /paypal|kraken|coinbase|stripeTreasury|STRIPE_TREASURY/i);
  assert.doesNotMatch(registry, /USD_ACH|BANK_PROVIDER_REFERENCE/);
  assert.equal(existsSync(resolve(repo, 'apps/api/src/stripe-treasury.ts')), false);
});

test('Stripe evidence cannot manufacture a Capital Account funding route', () => {
  const financial = read('apps/api/src/financial-routes.ts');
  const client = read('apps/app/lib/api/financial.ts');
  const capitalAccount = read('apps/app/app/dashboard/capital-account/CapitalAccountView.tsx');

  assert.match(financial, /verifyStripeWebhook/);
  assert.match(financial, /recordWebhook/);
  assert.doesNotMatch(`${financial}\n${client}\n${capitalAccount}`, /USD_ACH|ENABLE_FIAT/);
  assert.match(capitalAccount, /capabilities\.map/);
});
