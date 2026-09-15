import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('platform checklist keeps product surfaces subordinate to API and Platform Core', async () => {
  const checklist = await readFile(new URL('../../../docs/54_PROVIDER_PLATFORM_CHECKLIST.md', import.meta.url), 'utf8');
  assert.match(checklist, /Pay: orchestrate money movement without becoming the ledger/);
  assert.match(checklist, /Forge: expose stable Neptlium APIs\/events\/sandbox/);
  assert.match(checklist, /Platform Core: own authorization, policy, canonical ledger, reconciliation and audit/);
});
