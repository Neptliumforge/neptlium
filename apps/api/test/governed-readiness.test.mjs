import assert from 'node:assert/strict';
import test from 'node:test';
import { SupabaseFinancialRepository } from '../dist/financial-repository.js';

test('governed readiness probes every required current financial primitive', async () => {
  const paths = [];
  const repository = new SupabaseFinancialRepository(
    'https://example.supabase.co',
    'service-role',
    async (url) => {
      paths.push(new URL(url).pathname);
      return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
    },
  );
  assert.equal(await repository.ready(), true);
  for (const table of [
    'funding_intents',
    'treasury_destinations',
    'deposit_routes',
    'provider_webhook_inbox',
    'provider_references',
    'settlement_evidence',
    'ledger_accounts',
    'ledger_journals',
    'ledger_postings',
    'reconciliation_runs',
    'reconciliation_items',
    'transfer_executions',
    'capital_reservations',
  ])
    assert.ok(
      paths.some((path) => path.includes(`/${table}`)),
      `missing readiness probe for ${table}`,
    );
});

test('governed readiness fails closed when any required primitive is unavailable', async () => {
  const repository = new SupabaseFinancialRepository(
    'https://example.supabase.co',
    'service-role',
    async (url) =>
      new Response('[]', { status: String(url).includes('/ledger_postings?') ? 404 : 200 }),
  );
  assert.equal(await repository.ready(), false);
});
