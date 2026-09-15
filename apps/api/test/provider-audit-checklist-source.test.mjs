import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider audit checklist covers critical control-plane requirements', async () => {
  const checklist = await readFile(new URL('../../../docs/36_PROVIDER_AUDIT_CHECKLIST.md', import.meta.url), 'utf8');
  assert.match(checklist, /Provider evidence begins non-canonical\/unreconciled/);
  assert.match(checklist, /Ambiguous timeout recovery uses controlled lookup before retry/);
  assert.match(checklist, /Production mutation or financial execution has separate authorization/);
});
