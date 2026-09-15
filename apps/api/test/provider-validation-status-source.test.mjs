import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('provider validation status does not fabricate unexecuted checks', async () => {
  const status = await readFile(new URL('../../../docs/69_PROVIDER_VALIDATION_STATUS.md', import.meta.url), 'utf8');
  assert.match(status, /API typecheck: NOT RUN/);
  assert.match(status, /API test suite: NOT RUN/);
  assert.match(status, /Do not merge based on this document/);
});
