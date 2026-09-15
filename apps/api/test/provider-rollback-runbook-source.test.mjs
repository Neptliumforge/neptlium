import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider rollback preserves evidence and canonical history', async () => {
  const runbook = await readFile(new URL('../../../docs/48_PROVIDER_ROLLBACK_RUNBOOK.md', import.meta.url), 'utf8');
  assert.match(runbook, /Preserve durable Neptlium intents, provider evidence/);
  assert.match(runbook, /Stop blind retries/);
  assert.match(runbook, /Never delete provider evidence or rewrite ledger history/);
});
