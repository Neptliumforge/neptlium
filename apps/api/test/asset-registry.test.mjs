import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalAssetIdentity,
  governedAssetRegistry,
  publicFundingDefinitions,
} from '../dist/asset-registry.js';

test('governed asset registry supports at least ten asset-network definitions without public activation', () => {
  assert.ok(governedAssetRegistry.length >= 10);
  assert.deepEqual(
    publicFundingDefinitions().map((definition) => definition.capabilityCode).sort(),
    ['BTC_BITCOIN', 'ETH_BASE', 'USD_ACH', 'USDC_BASE', 'XRP_XRPL'].sort(),
  );
  for (const definition of governedAssetRegistry.filter((item) => !item.publiclyAddressable)) {
    assert.equal(definition.productionEnabled, false);
    assert.notEqual(definition.depositCapability, 'ENABLED');
    assert.notEqual(definition.withdrawalCapability, 'ENABLED');
  }
});

test('canonical asset identity always includes asset network and environment', () => {
  assert.notEqual(
    canonicalAssetIdentity('USDC', 'BASE', 'LIVE'),
    canonicalAssetIdentity('USDC', 'ETHEREUM', 'LIVE'),
  );
  assert.notEqual(
    canonicalAssetIdentity('USDC', 'BASE', 'LIVE'),
    canonicalAssetIdentity('USDC', 'BASE', 'TEST'),
  );
});

test('registry models rail differences rather than assuming EVM addresses', () => {
  const byCode = Object.fromEntries(governedAssetRegistry.map((definition) => [definition.capabilityCode, definition]));
  assert.equal(byCode.BTC_BITCOIN.addressFormat, 'BITCOIN');
  assert.equal(byCode.ETH_BASE.addressFormat, 'EVM');
  assert.equal(byCode.USDC_BASE.assetClass, 'TOKEN');
  assert.equal(byCode.XRP_XRPL.depositMethod, 'ADDRESS_WITH_MEMO_TAG');
  assert.equal(byCode.USD_ACH.addressFormat, 'BANK_PROVIDER_REFERENCE');
  assert.equal(byCode.USD_ACH.depositMethod, 'BANK_REFERENCE');
});
