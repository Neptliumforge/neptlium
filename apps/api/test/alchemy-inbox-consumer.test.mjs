import test from 'node:test';
import assert from 'node:assert/strict';
import { AlchemyInboxConsumer } from '../dist/alchemy-inbox-consumer.js';
import { BASE_MAINNET_USDC_CONTRACT } from '../dist/alchemy-observer.js';
import { processStoredWebhook } from '../dist/webhook-assurance.js';

const txHash = `0x${'1'.repeat(64)}`;
const blockHash = `0x${'2'.repeat(64)}`;
const sender = `0x${'3'.repeat(40)}`;
const recipient = `0x${'4'.repeat(40)}`;
const payload = {
  id: 'event-1',
  webhookId: 'wh_1',
  type: 'ADDRESS_ACTIVITY',
  createdAt: '2026-11-11T00:00:00Z',
  event: { network: 'BASE_MAINNET', activity: [{ hash: txHash }] },
};
const config = {
  rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/test-only',
  supabaseUrl: 'https://db.test',
  serviceRoleKey: 'fixture',
  webhookId: 'wh_1',
};
function fixture({
  wrongChain = false,
  reorg = false,
  routes = [
    {
      id: 'route-1',
      funding_intent_id: 'intent-1',
      treasury_destination_id: 'destination-1',
      status: 'active',
    },
  ],
} = {}) {
  const calls = [];
  const request = async (url, init = {}) => {
    calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : undefined });
    if (String(url).includes('/deposit_routes?')) return Response.json(routes);
    const body = JSON.parse(init.body);
    let result;
    switch (body.method) {
      case 'eth_chainId':
        result = wrongChain ? '0x1' : '0x2105';
        break;
      case 'eth_blockNumber':
        result = '0x15';
        break;
      case 'eth_getBlockByNumber':
        result = { number: '0x10', hash: reorg ? `0x${'5'.repeat(64)}` : blockHash };
        break;
      case 'eth_getTransactionReceipt':
        result = {
          transactionHash: txHash,
          blockHash,
          blockNumber: '0x10',
          status: '0x1',
          logs: [
            {
              address: BASE_MAINNET_USDC_CONTRACT,
              transactionHash: txHash,
              blockHash,
              blockNumber: '0x10',
              logIndex: '0x0',
              data: `0x${1000000n.toString(16).padStart(64, '0')}`,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                `0x${sender.slice(2).padStart(64, '0')}`,
                `0x${recipient.slice(2).padStart(64, '0')}`,
              ],
            },
          ],
        };
        break;
      default:
        assert.fail(`Unexpected RPC ${body.method}`);
    }
    return Response.json({ jsonrpc: '2.0', id: 1, result });
  };
  return { calls, consumer: new AlchemyInboxConsumer(config, request) };
}

test('receipt and governed route establish exact noncanonical USDC observation, never a ledger action', async () => {
  const { consumer, calls } = fixture();
  let disposition;
  let renewals = 0;
  const store = {
    claim: async () => ({ acquired: true, state: 'processing', token: 'fence', payload }),
    finish: async (_scope, _token, value) => {
      disposition = value;
    },
    fail: async () => assert.fail('unexpected'),
    renew: async () => {
      renewals++;
    },
  };
  await processStoredWebhook(
    store,
    { provider: 'alchemy', environment: 'live', providerEventId: payload.id },
    { webhookId: 'wh_1', resolve: (value, renew) => consumer.resolve(value, renew) },
  );
  const [evidence] = disposition.observations;
  assert.equal(evidence.rawAtomicAmount, '1000000');
  assert.equal(evidence.confirmations, 6);
  assert.equal(evidence.canonical, false);
  assert.equal(evidence.finalityState, 'CONFIRMING');
  assert.equal(evidence.recipient, recipient);
  assert.equal(evidence.fundingIntentId, 'intent-1');
  assert.equal(renewals, 5);
  assert.doesNotMatch(JSON.stringify(calls), /eth_send|ledger_|settle|make_funding_available/);
});

test('wrong chain, reorg and ambiguous routes reject; unrelated transfers stay unattributed', async () => {
  for (const options of [
    { wrongChain: true },
    { reorg: true },
    { routes: [{ id: 'a' }, { id: 'b' }] },
  ])
    await assert.rejects(() => fixture(options).consumer.resolve(payload));
  assert.deepEqual(await fixture({ routes: [] }).consumer.resolve(payload), []);
  assert.throws(() => new AlchemyInboxConsumer({ ...config, rpcUrl: 'https://attacker.example' }));
});

test('missing Alchemy resolver never marks an inbox event processed', async () => {
  let failures = 0;
  await assert.rejects(() =>
    processStoredWebhook(
      {
        claim: async () => ({ acquired: true, state: 'processing', token: 'fence', payload }),
        finish: async () => assert.fail('consumer unavailable'),
        fail: async () => {
          failures++;
        },
      },
      { provider: 'alchemy', environment: 'live', providerEventId: payload.id },
    ),
  );
  assert.equal(failures, 1);
});
