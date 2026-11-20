import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
function load(file) {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8');
  const output = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const result = {};
  new Function('exports', output)(result);
  return result;
}
const { diagnoseSourceGas } = load('../src/cross-chain/gas.ts');
const { previewBridgeQuote } = load('../src/cross-chain/quote.ts');
test('zero native gas reports exact shortfall', () => {
  assert.deepEqual(diagnoseSourceGas({nativeBalanceWei:0n,estimatedGasWei:3547145320n,sponsorshipVerified:false}), {
    status:'INSUFFICIENT',shortfallWei:'3547145320',executionAuthorized:false
  });
});
test('missing gas estimate remains unknown', () => {
  assert.equal(diagnoseSourceGas({nativeBalanceWei:0n,estimatedGasWei:null,sponsorshipVerified:false}).status,'UNKNOWN');
});
test('verified sponsorship is diagnostic only', () => {
  const result = diagnoseSourceGas({nativeBalanceWei:0n,estimatedGasWei:100n,sponsorshipVerified:true});
  assert.equal(result.status,'SPONSORED');
  assert.equal(result.executionAuthorized,false);
});
test('negative gas rejected', () => assert.throws(() => diagnoseSourceGas({nativeBalanceWei:-1n,estimatedGasWei:0n,sponsorshipVerified:false})));
const quote = {providerId:'test-provider',sourceChainId:42161,destinationChainId:8453,inputAmountBaseUnits:'1000000',outputAmountBaseUnits:'990000',feeAmountBaseUnits:'10000',expiresAt:'2030-01-01T00:00:00Z'};
test('quote is non-executable and unverified', () => {
  const result=previewBridgeQuote(quote,new Date('2026-01-01T00:00:00Z'));
  assert.equal(result.status,'UNVERIFIED_QUOTE');
  assert.equal(result.executionAuthorized,false);
});
test('expired quote rejected',()=>assert.throws(()=>previewBridgeQuote({...quote,expiresAt:'2020-01-01T00:00:00Z'})));
test('invalid route rejected',()=>assert.throws(()=>previewBridgeQuote({...quote,destinationChainId:1})));
test('output above input is not rejected without provider-specific pricing rules',()=>{\n  const result=previewBridgeQuote({...quote,outputAmountBaseUnits:'1000001'});\n  assert.equal(result.executionAuthorized,false);\n});
test('negative fee rejected',()=>assert.throws(()=>previewBridgeQuote({...quote,feeAmountBaseUnits:'-1'})));
