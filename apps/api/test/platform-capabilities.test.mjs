import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';

const config = loadConfig({ NODE_ENV: 'test', API_ALLOWED_ORIGINS: 'https://app.neptlium.com' });

test('public platform capabilities fail closed and keep AI outside authority', async () => {
  const app = await buildApp({ config });
  const response = await app.inject({ method: 'GET', url: '/v1/platform/capabilities' });
  const body = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(body.authority.ai_creates_authority, false);
  assert.deepEqual(body.authority.sequence, [
    'mandate',
    'authority_check',
    'denied_or_approval_required_or_authorized',
    'execution',
    'reconciliation',
    'record',
  ]);
  assert.equal(
    body.capabilities.find((item) => item.id === 'execution.agentic_capital').state,
    'unavailable',
  );
  assert.equal(
    body.capabilities.find((item) => item.id === 'authority.organization_policy').state,
    'planned',
  );
});

test('API responses carry non-cacheable security headers', async () => {
  const app = await buildApp({ config });
  const response = await app.inject({ method: 'GET', url: '/v1/platform/capabilities' });

  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'DENY');
  assert.match(response.headers['permissions-policy'], /payment=\(\)/);
});
