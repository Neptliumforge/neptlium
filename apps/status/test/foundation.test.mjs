import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const page = readFileSync(resolve(root, 'app/page.tsx'), 'utf8');

test('status page does not fabricate uptime or an operational state', () => {
  assert.match(page, /Status data unavailable/);
  assert.match(page, /does not fabricate historical availability/);
  assert.doesNotMatch(page, /99\.9|99\.99|99\.999|All systems operational/i);
});

test('status page exposes only public service categories', () => {
  for (const service of ['Neptlium Website','Neptlium Capital','Neptlium Treasury','Neptlium API','Neptlium Pay','Provider Ingress','Notifications','Documents']) assert.match(page, new RegExp(service));
  assert.doesNotMatch(page, /postgres|supabase|vercel function|circle api key|alchemy key/i);
});
