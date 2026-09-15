import test from 'node:test';
import assert from 'node:assert/strict';
import { neptliumFinancialAuthority, providerDoctrine } from '../dist/provider-doctrine.js';

test('Neptlium retains all canonical financial authority primitives', () => {
  assert.equal(Object.values(neptliumFinancialAuthority).every(Boolean), true);
});

test('no strategic provider is marked authoritative', () => {
  for (const [provider, contract] of Object.entries(providerDoctrine)) {
    assert.equal(contract.authoritative, false, `${provider} must remain infrastructure, not financial authority`);
  }
});
