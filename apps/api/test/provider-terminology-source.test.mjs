import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider terminology preserves precise capability lifecycle language', async () => {
  const terms = await readFile(new URL('../../../docs/30_PROVIDER_TERMINOLOGY.md', import.meta.url), 'utf8');
  for (const phrase of ['Configured:', 'Connectivity verified:', 'Capability certified:', 'Execution enabled:', 'Ambiguous outcome:']) assert.match(terms, new RegExp(`\\*\\*${phrase}`));
});
