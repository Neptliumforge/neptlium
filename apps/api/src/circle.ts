import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { ApiError } from './errors.js';
import type { CapitalProvider, CapitalEnvironment, CapitalNetwork, ProviderBalance, ProviderTransaction, ProviderWalletLink } from './providers.js';

type CircleWallet = { id?: string; walletSetId?: string; accountType?: string; blockchain?: string; address?: string; state?: string };
type CircleTransaction = Record<string, unknown> & { id?: string; state?: string };
type CircleClient = {
  createWallets(input: Record<string, unknown>): Promise<{ data?: { wallets?: CircleWallet[] } }>;
  getWallet(input: { id: string }): Promise<{ data?: { wallet?: CircleWallet } }>;
  getWalletTokenBalance(input: { id: string }): Promise<{ data?: { tokenBalances?: Array<{ token?: { symbol?: string; blockchain?: string }; amount?: string }> } }>;
  listTransactions(input: Record<string, unknown>): Promise<{ data?: { transactions?: CircleTransaction[] } }>;
  getTransaction(input: { id: string }): Promise<{ data?: { transaction?: CircleTransaction } }>;
  createTransaction(input: Record<string, unknown>): Promise<{ data?: CircleTransaction }>;
};
type CircleFactory = (input: { apiKey: string; entitySecret: string }) => CircleClient;

const blockchainFor = (environment: CapitalEnvironment): CapitalNetwork => environment === 'production' ? 'BASE' : 'BASE-SEPOLIA';
const usdcTokenAddressFor = (environment: CapitalEnvironment) =>
  environment === 'production'
    ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    : '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

function safeProviderFailure(): ApiError { return new ApiError(503, 'provider_unavailable', 'Capital provider is temporarily unavailable'); }
function providerRejected(): ApiError { return new ApiError(502, 'provider_rejected', 'Capital provider rejected the transfer request'); }
function deterministicUuid(value: string): string {
  const bytes = createHash('sha256').update(value).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
function atomicToDecimal(amountAtomic: string, decimals = 6): string {
  if (!/^\d+$/.test(amountAtomic) || BigInt(amountAtomic) <= 0n) throw new ApiError(422, 'validation_failed', 'Transfer amount must be a positive atomic integer');
  const scale = 10n ** BigInt(decimals);
  const whole = BigInt(amountAtomic) / scale;
  const fraction = (BigInt(amountAtomic) % scale).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
function walletLink(wallet: CircleWallet, environment: CapitalEnvironment): ProviderWalletLink {
  const blockchain = blockchainFor(environment);
  if (!wallet.id || !wallet.address || wallet.blockchain !== blockchain || wallet.accountType !== 'EOA') throw safeProviderFailure();
  return { provider: 'circle', providerWalletId: wallet.id, ...(wallet.walletSetId ? { providerWalletSetId: wallet.walletSetId } : {}), accountType: 'EOA', blockchain, address: wallet.address, environment, status: wallet.state === 'LIVE' ? 'live' : 'pending' };
}
export function initializeCircleSdk(apiKey: string | undefined, entitySecret: string | undefined): CircleClient {
  if (!apiKey || !entitySecret) throw new Error('Circle requires CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET');
  const require = createRequire(import.meta.url);
  const sdk = require('@circle-fin/developer-controlled-wallets') as { initiateDeveloperControlledWalletsClient?: CircleFactory };
  if (!sdk.initiateDeveloperControlledWalletsClient) throw new Error('Circle SDK client factory is unavailable');
  return sdk.initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}
export class CircleCapitalProvider implements CapitalProvider {
  readonly identity = 'circle';
  constructor(private readonly client: CircleClient, readonly environment: CapitalEnvironment, private readonly walletSetId?: string, private readonly liveExecutionEnabled = false) {}
  readiness() { return 'configured' as const; }
  supports(asset: string, network: string) { return asset === 'USDC' && network === blockchainFor(this.environment); }
  async provisionWallet(): Promise<ProviderWalletLink> {
    throw new ApiError(403, 'provider_execution_disabled', 'Automatic Circle wallet provisioning is disabled');
  }
  async lookupWallet(providerWalletId: string) {
    try { const wallet = (await this.client.getWallet({ id: providerWalletId })).data?.wallet; if (!wallet) throw safeProviderFailure(); return walletLink(wallet, this.environment); }
    catch { throw safeProviderFailure(); }
  }
  async getDepositAddress(wallet: ProviderWalletLink) {
    if (!this.supports('USDC', wallet.blockchain) || wallet.environment !== this.environment || wallet.status !== 'live')
      throw new ApiError(409, 'provider_wallet_unavailable', 'Capital Account deposit destination is unavailable');
    return wallet;
  }
  async getBalances(wallet: ProviderWalletLink): Promise<ProviderBalance[]> {
    try {
      const balances = (await this.client.getWalletTokenBalance({ id: wallet.providerWalletId })).data?.tokenBalances ?? [];
      const network = blockchainFor(this.environment);
      const usdc = balances.find((item) => item.token?.symbol === 'USDC' && item.token.blockchain === network);
      return usdc?.amount === undefined ? [] : [{ asset: 'USDC', network, available: usdc.amount, observedAt: new Date().toISOString(), synchronizationState: 'provider_observed' }];
    } catch { throw safeProviderFailure(); }
  }
  async createTransfer(input: { wallet: ProviderWalletLink; idempotencyKey: string; asset: 'USDC'; network: CapitalNetwork; amount: string; destination: string }): Promise<ProviderTransaction> {
    if (!this.liveExecutionEnabled) throw new ApiError(403, 'provider_execution_disabled', 'Circle transfer execution is disabled');
    if (!this.supports(input.asset, input.network) || input.wallet.environment !== this.environment || input.wallet.status !== 'live')
      throw new ApiError(409, 'provider_capability_unavailable', 'Circle does not support this transfer capability');
    try {
      const response = await this.client.createTransaction({
        idempotencyKey: deterministicUuid(input.idempotencyKey),
        walletId: input.wallet.providerWalletId,
        blockchain: input.network,
        tokenAddress: usdcTokenAddressFor(this.environment),
        destinationAddress: input.destination,
        amount: [atomicToDecimal(input.amount)],
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
        refId: input.idempotencyKey.slice(0, 64),
      });
      const transaction = response.data;
      if (!transaction?.id || typeof transaction.state !== 'string') throw safeProviderFailure();
      return normalizeTransaction(transaction);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status && status >= 400 && status < 500) throw providerRejected();
      throw safeProviderFailure();
    }
  }
  async getTransfer(providerReference: string) { try { return normalizeTransaction((await this.client.getTransaction({ id: providerReference })).data?.transaction); } catch { throw safeProviderFailure(); } }
  async listTransactions(providerWalletId: string) { try { return ((await this.client.listTransactions({ walletIds: [providerWalletId] })).data?.transactions ?? []).map(normalizeTransaction); } catch { throw safeProviderFailure(); } }
  reconciliationMetadata(wallet: ProviderWalletLink) { return { provider: this.identity, provider_wallet_id: wallet.providerWalletId, asset: 'USDC', network: wallet.blockchain, environment: wallet.environment, last_provider_observation: new Date().toISOString(), reconciliation_state: 'unreconciled' }; }
}
export function normalizeTransaction(tx: Record<string, unknown> | undefined): ProviderTransaction {
  if (!tx || typeof tx.id !== 'string') throw safeProviderFailure();
  const state = typeof tx.state === 'string' ? tx.state : 'UNKNOWN';
  const ledgerState = ['COMPLETE', 'CONFIRMED'].includes(state) ? 'settled' : ['FAILED', 'DENIED'].includes(state) ? 'failed' : state === 'CANCELLED' ? 'cancelled' : 'submitted';
  return { providerReference: tx.id, providerState: state, ledgerState, observedAt: new Date().toISOString() };
}
