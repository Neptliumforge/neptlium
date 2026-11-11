import { ApiError } from './errors.js';
import { BASE_MAINNET_USDC_CONTRACT, type AlchemyTransferObservation } from './alchemy-observer.js';
import { validateAlchemyEnvelope } from './alchemy-observation.js';
import { recoverWebhooks, SupabaseFencedWebhookStore } from './webhook-assurance.js';

const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const hash = /^0x[0-9a-f]{64}$/i;
const quantity = /^0x[0-9a-f]+$/i;
const unavailable = () =>
  new ApiError(503, 'provider_response_invalid', 'Chain observation could not be verified');

/** Explicit, read-only Base USDC observation worker; nothing schedules or exposes it. */
export class AlchemyInboxConsumer {
  constructor(
    private readonly config: {
      rpcUrl: string;
      supabaseUrl: string;
      serviceRoleKey: string;
      webhookId: string;
    },
    private readonly request: typeof fetch = fetch,
  ) {
    const url = new URL(config.rpcUrl);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'base-mainnet.g.alchemy.com' ||
      url.username ||
      url.password
    )
      throw unavailable();
  }
  private async rpc(method: string, params: unknown[], renew?: () => Promise<void>) {
    await renew?.();
    const response = await this.request(this.config.rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: AbortSignal.timeout(5_000),
      redirect: 'error',
    });
    if (!response.ok) throw unavailable();
    const value = await response.json();
    if (value.error || value.jsonrpc !== '2.0' || value.id !== 1) throw unavailable();
    return value.result;
  }
  async resolve(
    payload: Record<string, unknown>,
    renew?: () => Promise<void>,
  ): Promise<AlchemyTransferObservation[]> {
    const rpc = (method: string, params: unknown[]) => this.rpc(method, params, renew);
    validateAlchemyEnvelope(payload, {
      webhookId: this.config.webhookId,
      environment: 'production',
    });
    const activity = (payload.event as { activity: Array<{ hash?: string }> }).activity;
    if (activity.length > 100) throw unavailable();
    if ((await rpc('eth_chainId', [])) !== '0x2105') throw unavailable();
    const head: unknown = await rpc('eth_blockNumber', []);
    if (typeof head !== 'string' || !quantity.test(head)) throw unavailable();
    const result: AlchemyTransferObservation[] = [];
    const hashes = [...new Set(activity.map((item) => item.hash))];
    for (const txHash of hashes) {
      if (!txHash || !hash.test(txHash)) throw unavailable();
      const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
      if (
        !receipt ||
        receipt.transactionHash?.toLowerCase() !== txHash.toLowerCase() ||
        receipt.status !== '0x1' ||
        !hash.test(receipt.blockHash) ||
        !quantity.test(receipt.blockNumber) ||
        !Array.isArray(receipt.logs)
      )
        throw unavailable();
      const block = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false]);
      if (
        block?.hash?.toLowerCase() !== receipt.blockHash.toLowerCase() ||
        block.number !== receipt.blockNumber
      )
        throw unavailable();
      const confirmations = BigInt(head) - BigInt(receipt.blockNumber) + 1n;
      if (confirmations < 1n || confirmations > BigInt(Number.MAX_SAFE_INTEGER))
        throw unavailable();
      for (const log of receipt.logs) {
        if (
          log.address?.toLowerCase() !== BASE_MAINNET_USDC_CONTRACT ||
          log.topics?.[0]?.toLowerCase() !== transferTopic
        )
          continue;
        if (
          log.removed === true ||
          log.transactionHash?.toLowerCase() !== txHash.toLowerCase() ||
          log.blockHash?.toLowerCase() !== receipt.blockHash.toLowerCase() ||
          log.blockNumber !== receipt.blockNumber ||
          log.topics.length !== 3 ||
          !hash.test(log.topics[1]) ||
          !hash.test(log.topics[2]) ||
          !hash.test(log.data) ||
          !quantity.test(log.logIndex) ||
          BigInt(log.logIndex) > BigInt(Number.MAX_SAFE_INTEGER)
        )
          throw unavailable();
        const to = `0x${log.topics[2].slice(-40)}`.toLowerCase();
        const from = `0x${log.topics[1].slice(-40)}`.toLowerCase();
        await renew?.();
        const response = await this.request(
          `${this.config.supabaseUrl}/rest/v1/deposit_routes?environment=eq.live&network=eq.BASE&asset=eq.USDC&deposit_address=ilike.${encodeURIComponent(to)}&select=id,funding_intent_id,treasury_destination_id,status&limit=2`,
          {
            headers: {
              apikey: this.config.serviceRoleKey,
              authorization: `Bearer ${this.config.serviceRoleKey}`,
            },
            signal: AbortSignal.timeout(5_000),
            redirect: 'error',
          },
        );
        if (!response.ok) throw unavailable();
        const routes = await response.json();
        if (!Array.isArray(routes)) throw unavailable();
        if (routes.length === 0) continue; // Unrelated transfers are not attributed to customers.
        if (
          routes.length !== 1 ||
          routes[0].status !== 'active' ||
          !routes[0].id ||
          !routes[0].funding_intent_id ||
          !routes[0].treasury_destination_id
        )
          throw unavailable();
        const amountAtomic = BigInt(log.data).toString();
        if (amountAtomic === '0') continue;
        result.push({
          chainId: 8453,
          txHash,
          asset: 'USDC',
          network: 'BASE',
          from,
          to,
          amountAtomic,
          receiptPresent: true,
          receiptStatus: 'SUCCESS',
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          confirmations: Number(confirmations),
          transferType: 'ERC20',
          tokenContract: BASE_MAINNET_USDC_CONTRACT,
          tokenDecimals: 6,
          logIndex: Number(BigInt(log.logIndex)),
          observedAt: String(payload.createdAt),
          treasuryDestinationId: routes[0].treasury_destination_id,
          depositRouteId: routes[0].id,
          fundingIntentId: routes[0].funding_intent_id,
        });
        if (result.length > 100) throw unavailable();
      }
    }
    return result;
  }
  recover(limit = 25) {
    return recoverWebhooks(
      new SupabaseFencedWebhookStore(
        this.config.supabaseUrl,
        this.config.serviceRoleKey,
        this.request,
      ),
      limit,
      {
        webhookId: this.config.webhookId,
        resolve: (payload, renew) => this.resolve(payload, renew),
      },
    );
  }
}
