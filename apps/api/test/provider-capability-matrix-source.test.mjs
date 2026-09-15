import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('capability matrix keeps canonical authority in Platform Core', async () => {
  const matrix = await readFile(new URL('../../../docs/18_PROVIDER_CAPABILITY_MATRIX.md', import.meta.url), 'utf8');
  assert.match(matrix, /Canonical balance \| Never \| Never \| Never \| \*\*Neptlium Platform Core\*\*/);
  assert.match(matrix, /Canonical ledger \| Never \| Never \| Never \| \*\*Neptlium Platform Core\*\*/);
  assert.match(matrix, /Authorization\/approvals \| Never \| Never \| Never \| \*\*Neptlium Platform Core\*\*/);
});
