import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const architecture = readFileSync(new URL('../lib/content/public-architecture.ts', import.meta.url), 'utf8');

test('primary navigation remains five-domain institutional architecture', () => {
  const navBlock = architecture.slice(architecture.indexOf('export const NAVIGATION'), architecture.indexOf('export const INDEXABLE_ROUTES'));
  for (const label of ['Platform','Products','Solutions','Resources','Company']) assert.match(navBlock, new RegExp(`label: '${label}'`));
  assert.doesNotMatch(navBlock, /label: 'Press'|label: 'Performance'|label: 'Capital Universe'/);
});
