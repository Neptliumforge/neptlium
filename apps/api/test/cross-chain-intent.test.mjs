import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/cross-chain/intent.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const { createTransferIntentPreview, USDC_NETWORKS } = exports;
const input = {
  sourceChainId: 42161,
  destinationChainId: 8453,
  sourceToken: USDC_NETWORKS.arbitrum.contract,
  destinationToken: USDC_NETWORKS.base.contract,
  sender: '0x1111111111111111111111111111111111111111',
  recipient: '0x2222222222222222222222222222222222222222',
  amountBaseUnits: '1000000',
};

test('valid native USDC Arbitrum to Base preview remains non-executable', () => {
  const result = createTransferIntentPreview(input);
  assert.equal(result.status, 'PREVIEW_ONLY');
  assert.equal(result.executionAvailable, false);
  assert.equal(result.gasRequirement, 'UNKNOWN');
  assert.equal(Object.isFrozen(result), true);
});
test('rejects unsupported route', () => assert.throws(() => createTransferIntentPreview({ ...input, destinationChainId: 1 })));
test('rejects mismatched token contract', () => assert.throws(() => createTransferIntentPreview({ ...input, sourceToken: input.destinationToken })));
test('rejects invalid recipient', () => assert.throws(() => createTransferIntentPreview({ ...input, recipient: 'invalid' })));
for (const amountBaseUnits of ['0', '-1', '1.5', '01', 'not-a-number', (2n ** 256n).toString()]) {
  test('rejects invalid amount ' + amountBaseUnits, () => assert.throws(() => createTransferIntentPreview({ ...input, amountBaseUnits })));
}
