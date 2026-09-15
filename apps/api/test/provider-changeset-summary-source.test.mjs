import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('changeset summary accurately describes provider doctrine scope', async () => {
  const summary = await readFile(new URL('../../../docs/59_PROVIDER_CHANGESET_SUMMARY.md', import.meta.url), 'utf8');
  assert.match(summary, /Alchemy owns multi-chain blockchain observation\/intelligence capabilities, never financial execution authority/);
  assert.match(summary, /Existing Base-only runtime behavior is explicitly preserved as CURRENT/);
  assert.match(summary, /No production provider\/environment mutation or financial execution/);
});
