import test from 'node:test';
import assert from 'node:assert/strict';
import { chainRegistry } from '../dist/chain-registry.js';

test('registry membership never implies economic execution', () => {
  for (const [id, chain] of Object.entries(chainRegistry)) {
    assert.equal(chain.capabilities.rpc, 'declared', `${id} RPC should begin as declared`);
    assert.equal(chain.capabilities.observation, 'declared', `${id} observation should begin as declared`);
    assert.equal(chain.capabilities.deposits, 'disabled', `${id} deposits must fail closed`);
    assert.equal(chain.capabilities.withdrawals, 'disabled', `${id} withdrawals must fail closed`);
    assert.equal(chain.capabilities.contract_execution, 'disabled', `${id} contract execution must fail closed`);
  }
});
