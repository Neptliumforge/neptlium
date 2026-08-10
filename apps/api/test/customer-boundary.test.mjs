import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';
import { MemoryRepository } from '../dist/repositories.js';

function createApp() {
  const repository = new MemoryRepository();
  const config = loadConfig({
    NODE_ENV: 'test',
    API_ALLOWED_ORIGINS: 'http://localhost:3001',
  });
  return buildApp({
    config,
    repository,
    authenticate: async (token) => token === 'owner-token' ? { id: 'owner-1', role: 'user' } : null,
  });
}

const auth = { authorization: 'Bearer owner-token' };

test('customer state endpoints require an authenticated principal', async () => {
  const app = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/customer/overview' });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, 'authentication_required');
  await app.close();
});

test('overview returns explicit backend-owned resource states instead of numeric fallbacks', async () => {
  const app = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/customer/overview', headers: auth });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.capital.total.state, 'UNAVAILABLE');
  assert.equal(body.capital.available.state, 'UNAVAILABLE');
  assert.equal(body.capital.reserved.state, 'UNAVAILABLE');
  assert.equal(body.capital.allocated.state, 'UNAVAILABLE');
  assert.equal(body.allocation.state, 'NOT_CONFIGURED');
  assert.equal(body.activity.state, 'EMPTY');
  assert.equal('value' in body.capital.total, false);
  await app.close();
});

test('Capital Account keeps provider observation separate from canonical state', async () => {
  const app = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/capital-account/state', headers: auth });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.canonical.total.state, 'UNAVAILABLE');
  assert.equal(body.canonical.available.state, 'UNAVAILABLE');
  assert.equal(body.provider_observation.state, 'NOT_CONFIGURED');
  assert.equal(body.funding.state, 'NOT_CONFIGURED');
  await app.close();
});

test('account context is owner-scoped behind the API boundary', async () => {
  const app = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/account/context', headers: auth });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, 'owner-1');
  assert.equal(response.json().role, 'user');
  await app.close();
});

test('customer mutations do not accept unauthenticated callers', async () => {
  const app = await createApp();
  for (const [url, payload] of [
    ['/v1/account/onboarding-draft', { data: {}, step_index: 0 }],
    ['/v1/notifications/read-all', undefined],
  ]) {
    const response = await app.inject({ method: 'POST', url, ...(payload ? { payload } : {}) });
    assert.equal(response.statusCode, 401, url);
  }
  await app.close();
});
