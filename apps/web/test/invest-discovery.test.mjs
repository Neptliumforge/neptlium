import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

// Public Invest discovery (lib/content/invest.ts) is editorial and owned by
// Marketing; the catalog migration owns product identity and availability.
// These checks keep the two aligned without making Web a second catalog.

const web = resolve(import.meta.dirname, '..');
const repo = resolve(web, '..', '..');
const content = readFileSync(resolve(web, 'lib/content/invest.ts'), 'utf8');
const migration = readFileSync(resolve(repo, 'supabase/migrations/20261022090000_invest_product_catalog.sql'), 'utf8');

const seeded = [...migration.matchAll(
  /jsonb_build_object\(\s*'slug', '([^']+)', 'family', '([A-Z_]+)', 'availability', '([A-Z_]+)'[\s\S]*?'name', '([^']+)'/g,
)].map(([, slug, family, availability, name]) => ({ slug, family, availability, name }));

test('public research collections are the catalog research-only collections', () => {
  const collections = seeded.filter((item) => item.family === 'THEMATIC_COLLECTION');
  assert.equal(collections.length, 5);
  const published = [...content.matchAll(/slug: '([^']+)',\s*title: '([^']+)'/g)].map(([, slug, title]) => ({ slug, title }));
  assert.deepEqual(published, collections.map(({ slug, name }) => ({ slug, title: name })));
  for (const item of collections) assert.equal(item.availability, 'RESEARCH_ONLY', item.slug);
});

test('public plan families are the catalog plan concepts', () => {
  const plans = seeded.filter((item) => item.family === 'MANAGED_PLAN');
  assert.equal(plans.length, 4);
  const families = [...content.matchAll(/name: '([^']+)',\s*objective:/g)].map(([, name]) => name);
  assert.deepEqual(families, plans.map((plan) => plan.name.replace(/^Neptlium /, '')));
  for (const plan of plans) assert.equal(plan.availability, 'CONCEPT', plan.slug);
});

test('public discovery keeps the catalog availability states and promises no return', () => {
  assert.match(content, /research-only, not funds, securities or purchasable portfolios/);
  assert.match(content, /product concepts, not available plans, recommendations or promises of return/);
  assert.doesNotMatch(content, /\d+(\.\d+)?\s?%|expected return|guaranteed return|invest now/i);
});
