import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../app/(admin)/dashboard/operations/page.tsx', import.meta.url), 'utf8');

test('admin operational UI consumes canonical admin API routes only', () => {
  for (const route of [
    '/v1/admin/fundings',
    '/v1/admin/withdrawals/canonical',
    '/v1/admin/reconciliation/runs',
    '/v1/admin/reconciliation/items',
    '/v1/admin/webhooks/provider',
  ]) assert.equal(page.includes(route), true);
  assert.equal(page.includes('adminApiRequest'), true);
  assert.equal(page.includes('supabase'), false);
  assert.equal(page.includes('execute'), false);
  assert.equal(page.includes('approve'), false);
  assert.equal(page.includes('retry'), false);
});
