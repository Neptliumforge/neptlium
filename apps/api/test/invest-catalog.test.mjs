import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildApp } from '../dist/app.js';
import { loadConfig } from '../dist/config.js';
import { executeAdminHttp } from '../dist/admin-http.js';
import {
  catalogDetail,
  catalogListing,
  parseCatalogQuery,
  selectCatalog,
} from '../dist/invest-catalog-domain.js';
import {
  MemoryInvestCatalogRepository,
  SupabaseInvestCatalogRepository,
} from '../dist/invest-catalog-repository.js';
import { seedProducts, seedSectors } from '../dist/invest-catalog-seed.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const migration = fs.readFileSync(
  path.join(root, 'supabase/migrations/20261022090000_invest_product_catalog.sql'),
  'utf8',
);
const config = loadConfig({ NODE_ENV: 'test', API_ALLOWED_ORIGINS: 'http://localhost' });
const authenticate = async (token) => (token === 'valid' ? { id: 'user-1' } : null);
const headers = { authorization: 'Bearer valid' };

async function publishAll(repository) {
  for (const version of await repository.adminCatalog()) {
    await repository.transition({ versionId: version.version_id, actor: 'admin-1', toStatus: 'APPROVED', rationale: 'Reviewed for test publication.' });
    await repository.transition({ versionId: version.version_id, actor: 'admin-1', toStatus: 'PUBLISHED', rationale: 'Published for test catalog.' });
  }
  return repository;
}

test('the in-memory seed mirrors the migration seed exactly', () => {
  for (const product of seedProducts) {
    for (const value of [product.slug, product.name, product.tagline, product.summary, product.body])
      assert.ok(migration.includes(`'${value.replaceAll("'", "''")}'`), `migration is missing: ${value}`);
    assert.ok(migration.includes(`'availability', '${product.availability}'`));
    if (product.sectors.length)
      assert.ok(migration.includes(`'${JSON.stringify(product.sectors).replaceAll(',', ', ')}'::jsonb`), `${product.slug} sectors differ`);
  }
  for (const sector of seedSectors)
    assert.ok(migration.includes(`('${sector.slug}', '${sector.name}', '${sector.description}', ${sector.sort_rank})`));
  assert.equal((migration.match(/jsonb_build_object\('slug', '/g) ?? []).length, seedProducts.length);
});

test('no return figure, price, holding or 3.7% claim is seeded anywhere', () => {
  const seedSource = fs.readFileSync(path.join(root, 'apps/api/src/invest-catalog-seed.ts'), 'utf8');
  for (const source of [migration.slice(migration.indexOf('-- Seed:')), seedSource]) {
    assert.doesNotMatch(source, /3\.7|370|return_figures|invest_instruments|guarantee/i);
    assert.doesNotMatch(source, /\b\d+(\.\d+)?\s?%/);
  }
});

test('a freshly migrated catalog publishes nothing until reviewed', async () => {
  const app = await buildApp({ config, authenticate, investCatalogRepository: new MemoryInvestCatalogRepository() });
  const response = await app.inject({ method: 'GET', url: '/v1/invest/catalog', headers });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().total, 0);
  assert.equal(response.json().published_total, 0);
  assert.deepEqual(response.json().items, []);
});

test('catalog routes require authentication', async () => {
  const app = await buildApp({ config, authenticate });
  for (const url of ['/v1/invest/catalog', '/v1/invest/catalog/reserve', '/v1/invest/sectors'])
    assert.equal((await app.inject({ method: 'GET', url })).statusCode, 401, url);
});

test('published catalog lists concepts and research collections with explicit states', async () => {
  const repository = await publishAll(new MemoryInvestCatalogRepository());
  const app = await buildApp({ config, authenticate, investCatalogRepository: repository });
  const body = (await app.inject({ method: 'GET', url: '/v1/invest/catalog', headers })).json();
  assert.equal(body.contract_version, 1);
  assert.equal(body.total, 9);
  assert.deepEqual(body.facets.availability, { CONCEPT: 4, RESEARCH_ONLY: 5 });
  assert.deepEqual(body.items.map((item) => item.slug), [
    'reserve', 'income', 'balanced', 'growth',
    'ai-compute', 'cloud-software', 'digital-infrastructure', 'energy-power', 'global-innovation',
  ]);
  for (const item of body.items) {
    assert.deepEqual(item.investing, { state: 'DISABLED', reason: 'investment_execution_not_enabled' });
    assert.notEqual(item.availability, 'INVESTABLE');
  }
  const reserve = body.items[0];
  assert.deepEqual(reserve.terms, {
    status: 'PROPOSED', currency: 'USD', minimum_minor: '30000', maximum_minor: '1000000',
    fee_note: 'Fees have not been set.', liquidity_note: 'Liquidity terms have not been set.',
  });
});

test('search matches all words across names, descriptions and sector names', async () => {
  const repository = await publishAll(new MemoryInvestCatalogRepository());
  const published = await repository.publishedCatalog();
  const search = (q, extra = '') => selectCatalog(published, parseCatalogQuery(new URLSearchParams(`q=${encodeURIComponent(q)}${extra}`))).map((d) => d.slug);
  assert.deepEqual(search('cybersecurity'), ['cloud-software']);
  assert.deepEqual(search('semiconductors'), ['ai-compute', 'digital-infrastructure']);
  assert.deepEqual(search('healthcare technology'), ['global-innovation']);
  assert.deepEqual(search('financial technology'), ['global-innovation']);
  assert.deepEqual(search('industrial automation'), ['energy-power', 'global-innovation']);
  assert.deepEqual(search('RESERVE'), ['reserve']);
  assert.deepEqual(search('managed plan', '&sort=name'), ['balanced', 'growth', 'income', 'reserve']);
  assert.deepEqual(search('quantum'), []);
});

test('filters, sorting and facets are applied server-side', async () => {
  const repository = await publishAll(new MemoryInvestCatalogRepository());
  const published = await repository.publishedCatalog();
  const listing = (qs) => catalogListing(published, parseCatalogQuery(new URLSearchParams(qs)), new Date(0));
  assert.deepEqual(listing('family=MANAGED_PLAN').items.map((i) => i.slug), ['reserve', 'income', 'balanced', 'growth']);
  assert.deepEqual(listing('availability=RESEARCH_ONLY&sector=energy-power').items.map((i) => i.slug), ['digital-infrastructure', 'energy-power']);
  assert.deepEqual(listing('family=MANAGED_PLAN&sort=name&order=desc').items.map((i) => i.slug), ['reserve', 'income', 'growth', 'balanced']);
  assert.equal(listing('availability=INVESTABLE').total, 0);
  assert.equal(listing('').facets.sector['artificial-intelligence'], 2);
});

test('invalid catalog queries are rejected', async () => {
  const app = await buildApp({ config, authenticate });
  for (const qs of ['family=FUND', 'availability=LIVE', 'sort=returns', 'order=up', 'sector=Not%20A%20Slug', `q=${'x'.repeat(81)}`]) {
    const response = await app.inject({ method: 'GET', url: `/v1/invest/catalog?${qs}`, headers });
    assert.equal(response.statusCode, 422, qs);
    assert.equal(response.json().error.code, 'validation_failed');
  }
});

test('product detail carries disclosures, closed eligibility and disabled investing', async () => {
  const repository = await publishAll(new MemoryInvestCatalogRepository());
  const app = await buildApp({ config, authenticate, investCatalogRepository: repository });
  const reserve = (await app.inject({ method: 'GET', url: '/v1/invest/catalog/reserve', headers })).json();
  assert.equal(reserve.availability, 'CONCEPT');
  assert.deepEqual(reserve.disclosures.map((d) => d.kind), ['CONCEPT_STATUS', 'PROPOSED_TERMS', 'NOT_AN_OFFER', 'RISK']);
  assert.equal(reserve.eligibility.length, 6);
  assert.ok(reserve.eligibility.every((e) => e.status === 'NOT_SUPPORTED'));
  assert.deepEqual(reserve.return_figures, []);
  assert.deepEqual(reserve.instruments, []);
  assert.deepEqual(reserve.investing, { state: 'DISABLED', reason: 'investment_execution_not_enabled' });
  const collection = (await app.inject({ method: 'GET', url: '/v1/invest/catalog/ai-compute', headers })).json();
  assert.equal(collection.availability, 'RESEARCH_ONLY');
  assert.equal(collection.terms, null);
  assert.equal(collection.disclosures[0].kind, 'RESEARCH_ONLY');
  for (const url of ['/v1/invest/catalog/unknown-product', '/v1/invest/catalog/Not_A_Slug']) {
    const response = await app.inject({ method: 'GET', url, headers });
    assert.equal(response.statusCode, 404, url);
  }
});

test('unpublished products are never served to customers', async () => {
  const repository = new MemoryInvestCatalogRepository();
  const app = await buildApp({ config, authenticate, investCatalogRepository: repository });
  const response = await app.inject({ method: 'GET', url: '/v1/invest/catalog/reserve', headers });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'invest_product_not_found');
});

test('customer detail never exposes hypothetical, unapproved or hidden return figures', () => {
  const base = { slug: 'x', family: 'THEMATIC_COLLECTION', availability: 'RESEARCH_ONLY', name: 'x', tagline: 'x', summary: 'x', body: 'x', objective: null, risk_level: null, sort_rank: 1, published_at: null, terms: null, sectors: [], instruments: [], eligibility: [], disclosures: [], version: 1 };
  const figure = (kind, approval_status, customer_visible) => ({ kind, value_bps: 370, period: '1Y', as_of: '2026-09-30', basis: 'b', source: 's', methodology_ref: 'm', approval_status, customer_visible });
  const detail = catalogDetail({
    ...base,
    return_figures: [
      figure('HYPOTHETICAL_SCENARIO', 'APPROVED', true),
      figure('APPROVED_TARGET', 'UNAPPROVED', true),
      figure('CURRENT_YIELD', 'APPROVED', false),
      figure('HISTORICAL_PERFORMANCE', 'APPROVED', true),
    ],
  });
  assert.deepEqual(detail.return_figures.map((f) => f.kind), ['HISTORICAL_PERFORMANCE']);
});

test('storage failure is unavailable, never an empty catalog', async () => {
  const failing = new SupabaseInvestCatalogRepository('https://db.test', 'service-key', async () => new Response('{}', { status: 500 }));
  const app = await buildApp({ config, authenticate, investCatalogRepository: failing });
  const response = await app.inject({ method: 'GET', url: '/v1/invest/catalog', headers });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'invest_catalog_unavailable');
  const malformed = new SupabaseInvestCatalogRepository('https://db.test', 'service-key', async () => new Response('{"not":"array"}', { status: 200 }));
  const second = await buildApp({ config, authenticate, investCatalogRepository: malformed });
  assert.equal((await second.inject({ method: 'GET', url: '/v1/invest/catalog', headers })).statusCode, 503);
});

test('the Supabase repository calls governed RPCs and maps database rules', async () => {
  const calls = [];
  const respond = (status, body) => async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  };
  const ok = new SupabaseInvestCatalogRepository('https://db.test', 'k', respond(200, { version_id: 'v', status: 'APPROVED', replayed: false }));
  await ok.transition({ versionId: '00000000-0000-4000-8000-000000000001', actor: 'admin-1', toStatus: 'APPROVED', rationale: 'Reviewed carefully.' });
  assert.equal(calls[0].url, 'https://db.test/rest/v1/rpc/invest_transition_version');
  assert.deepEqual(calls[0].body, { p_version_id: '00000000-0000-4000-8000-000000000001', p_actor: 'admin-1', p_to_status: 'APPROVED', p_rationale: 'Reviewed carefully.' });
  for (const [message, status, reason] of [
    ['publishing investable products is disabled', 409, 'investable_publication_disabled'],
    ['catalog approval requires a reviewer other than the author and submitter', 409, 'reviewer_must_differ'],
    ['catalog transition PUBLISHED -> APPROVED is not permitted', 409, 'transition_not_permitted'],
    ['concept publication requires a concept status disclosure', 409, 'disclosure_required'],
    ['catalog version not found', 404, undefined],
  ]) {
    const repository = new SupabaseInvestCatalogRepository('https://db.test', 'k', respond(400, { message }));
    await assert.rejects(
      () => repository.transition({ versionId: 'v', actor: 'a', toStatus: 'PUBLISHED', rationale: 'Attempted change.' }),
      (error) => error.status === status && error.details?.reason === reason,
      message,
    );
  }
});

// --- Administration --------------------------------------------------------

function adminRepository(role) {
  return { getRole: async () => role, audit: async () => {} };
}
const admin = (role, catalog, method, url, body) =>
  executeAdminHttp(
    config,
    { method, url, headers: { authorization: 'Bearer admin-token' }, clientAddress: '127.0.0.1', payload: body === undefined ? undefined : JSON.stringify(body) },
    { repository: adminRepository(role), authenticate: async () => ({ id: 'admin-1' }), investCatalogRepository: catalog },
  );

for (const role of ['admin', 'manager', 'operator', 'user']) {
  test(`${role} cannot manage the catalog`, async () => {
    const response = await admin(role, new MemoryInvestCatalogRepository(), 'GET', '/v1/admin/invest/catalog');
    assert.equal(response.statusCode, 403);
  });
}

test('the administrator reviews and publishes seeded content with recorded rationale', async () => {
  const catalog = new MemoryInvestCatalogRepository();
  const listed = JSON.parse((await admin('super_admin', catalog, 'GET', '/v1/admin/invest/catalog')).body);
  assert.equal(listed.versions.length, 9);
  const reserve = listed.versions.find((v) => v.slug === 'reserve');
  assert.equal(reserve.status, 'IN_REVIEW');
  const url = `/v1/admin/invest/versions/${reserve.version_id}/transition`;
  const noRationale = await admin('super_admin', catalog, 'POST', url, { to_status: 'APPROVED' });
  assert.equal(noRationale.statusCode, 422);
  const skip = await admin('super_admin', catalog, 'POST', url, { to_status: 'PUBLISHED', rationale: 'Skipping review step.' });
  assert.equal(skip.statusCode, 409);
  assert.equal((await admin('super_admin', catalog, 'POST', url, { to_status: 'APPROVED', rationale: 'Reviewed copy and disclosures.' })).statusCode, 200);
  const published = await admin('super_admin', catalog, 'POST', url, { to_status: 'PUBLISHED', rationale: 'Publishing reviewed concept.' });
  assert.equal(JSON.parse(published.body).status, 'PUBLISHED');
  assert.equal((await catalog.publishedCatalog()).length, 1);
});

test('authors cannot approve their own drafts and investable products cannot be published', async () => {
  const catalog = new MemoryInvestCatalogRepository();
  const created = await admin('super_admin', catalog, 'POST', '/v1/admin/invest/products/test-investable/versions', {
    family: 'MANAGED_PLAN',
    content: {
      availability: 'INVESTABLE', name: 'Test', tagline: 'Test', summary: 'Test', body: 'Test',
      disclosures: [{ kind: 'NOT_AN_OFFER', title: 'Not an offer', body: 'Not an offer.' }],
    },
  });
  assert.equal(created.statusCode, 201);
  const { version_id } = JSON.parse(created.body);
  const url = `/v1/admin/invest/versions/${version_id}/transition`;
  assert.equal((await admin('super_admin', catalog, 'POST', url, { to_status: 'IN_REVIEW' })).statusCode, 200);
  const selfApproval = await admin('super_admin', catalog, 'POST', url, { to_status: 'APPROVED', rationale: 'Approving my own draft.' });
  assert.equal(selfApproval.statusCode, 409);
  assert.equal(JSON.parse(selfApproval.body).error.details.reason, 'reviewer_must_differ');
  await catalog.transition({ versionId: version_id, actor: 'reviewer-2', toStatus: 'APPROVED', rationale: 'Second reviewer approval.' });
  const publish = await admin('super_admin', catalog, 'POST', url, { to_status: 'PUBLISHED', rationale: 'Attempting investable publish.' });
  assert.equal(publish.statusCode, 409);
  assert.equal(JSON.parse(publish.body).error.details.reason, 'investable_publication_disabled');
});

test('draft content is validated before reaching the database', async () => {
  const catalog = new MemoryInvestCatalogRepository();
  for (const [slug, body] of [
    ['Bad Slug', { family: 'MANAGED_PLAN', content: {} }],
    ['ok', { family: 'FUND', content: {} }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'LIVE', name: 'x', tagline: 'x', summary: 'x', body: 'x' } }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'CONCEPT', name: '', tagline: 'x', summary: 'x', body: 'x' } }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'CONCEPT', name: 'x', tagline: 'x', summary: 'x', body: 'x', risk_level: 9 } }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'CONCEPT', name: 'x', tagline: 'x', summary: 'x', body: 'x', terms: { currency: 'USD', minimum_minor: 300 } } }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'CONCEPT', name: 'x', tagline: 'x', summary: 'x', body: 'x', terms: { currency: 'USD', minimum_minor: '9', maximum_minor: '1' } } }],
    ['ok', { family: 'MANAGED_PLAN', content: { availability: 'CONCEPT', name: 'x', tagline: 'x', summary: 'x', body: 'x', disclosures: [{ kind: 'MARKETING', title: 'x', body: 'x' }] } }],
  ]) {
    const response = await admin('super_admin', catalog, 'POST', `/v1/admin/invest/products/${encodeURIComponent(slug)}/versions`, body);
    assert.equal(response.statusCode, 422, `${slug} ${JSON.stringify(body)}`);
  }
  const familyChange = await admin('super_admin', catalog, 'POST', '/v1/admin/invest/products/reserve/versions', {
    family: 'THEMATIC_COLLECTION',
    content: { availability: 'RESEARCH_ONLY', name: 'x', tagline: 'x', summary: 'x', body: 'x' },
  });
  assert.equal(familyChange.statusCode, 409);
});
