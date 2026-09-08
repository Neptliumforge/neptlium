import assert from 'node:assert/strict';
import test from 'node:test';
import { buildThesisApp } from '../dist/thesis-app.js';
import { loadConfig } from '../dist/config.js';
import { MemoryRepository } from '../dist/repositories.js';
import { MemoryThesisRepository } from '../dist/thesis-repository.js';

async function createApp() {
  const thesisRepository = new MemoryThesisRepository();
  const app = await buildThesisApp({
    config: loadConfig({ NODE_ENV: 'test', API_ALLOWED_ORIGINS: 'http://localhost:3001' }),
    repository: new MemoryRepository(),
    thesisRepository,
    authenticate: async (token) => token === 'owner-token' ? { id: 'owner-1', role: 'user' } : null,
  });
  return { app, thesisRepository };
}
const auth = { authorization: 'Bearer owner-token' };

test('thesis routes require authentication', async () => {
  const { app } = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/theses' });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, 'authentication_required');
});

test('thesis can be created, configured, evaluated, and read as entity fit', async () => {
  const { app, thesisRepository } = await createApp();
  const created = await app.inject({ method: 'POST', url: '/v1/theses', headers: auth, payload: {
    name: 'Growth Equity', strategy: 'GROWTH_EQUITY', sectors: ['Software'], geographies: ['United States'], isDefault: true,
  } });
  assert.equal(created.statusCode, 201);
  const thesisId = created.json().id;

  const criterion = await app.inject({ method: 'POST', url: `/v1/theses/${thesisId}/criteria`, headers: auth, payload: {
    metricKey: 'revenue_growth_yoy', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 25, weightBps: 10000, importance: 'REQUIRED', position: 0,
  } });
  assert.equal(criterion.statusCode, 201);

  thesisRepository.evidence.push({
    subjectType: 'company', subjectKey: 'datadog', metricKey: 'revenue_growth_yoy', claim: 'Revenue grew 31%.', observedValue: 31,
    sourceType: 'FILINGS', sourceDate: '2026-08-01', confidenceBps: 9500, reported: true, derived: false,
  });

  const evaluated = await app.inject({ method: 'POST', url: `/v1/theses/${thesisId}/evaluate`, headers: auth, payload: { subject_type: 'company', subject_key: 'datadog' } });
  assert.equal(evaluated.statusCode, 201);
  assert.equal(evaluated.json().decision, 'QUALIFIED');
  assert.equal(evaluated.json().scoreBps, 10000);
  assert.equal(evaluated.json().coverageBps, 10000);

  const fit = await app.inject({ method: 'GET', url: `/v1/entities/company/datadog/thesis-fit?thesis_id=${thesisId}`, headers: auth });
  assert.equal(fit.statusCode, 200);
  assert.equal(fit.json().live.decision, 'QUALIFIED');
  assert.equal(fit.json().latest_snapshot.decision, 'QUALIFIED');
  assert.equal(fit.json().stale_snapshot, false);
});

test('missing evidence remains insufficient and is persisted as such', async () => {
  const { app } = await createApp();
  const created = await app.inject({ method: 'POST', url: '/v1/theses', headers: auth, payload: {
    name: 'Value', strategy: 'PUBLIC_EQUITY', sectors: [], geographies: [],
  } });
  const thesisId = created.json().id;
  await app.inject({ method: 'POST', url: `/v1/theses/${thesisId}/criteria`, headers: auth, payload: {
    metricKey: 'free_cash_flow_margin', kind: 'QUANTITATIVE', operator: 'GTE', numericValue: 10, weightBps: 10000, importance: 'REQUIRED', position: 0,
  } });
  const evaluated = await app.inject({ method: 'POST', url: `/v1/theses/${thesisId}/evaluate`, headers: auth, payload: { subject_type: 'company', subject_key: 'unknown-company' } });
  assert.equal(evaluated.statusCode, 201);
  assert.equal(evaluated.json().decision, 'INSUFFICIENT_EVIDENCE');
  assert.equal(evaluated.json().coverageBps, 0);
});

test('non-thesis routes continue through canonical application unchanged', async () => {
  const { app } = await createApp();
  const response = await app.inject({ method: 'GET', url: '/v1/account/context', headers: auth });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, 'owner-1');
});
