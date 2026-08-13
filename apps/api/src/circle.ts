import { createRequire } from 'node:module';
import { ApiError } from './errors.js';
import type { CapitalProvider, CapitalEnvironment, CapitalNetwork, ProviderBalance, ProviderTransaction, ProviderWalletLink } from './providers.js';

type CircleWallet = { id?: string; walletSetId?: string; accountType?: string; blockchain?: string; address?: string; state?: string };
type CircleClient = {
  createWallets(input: Record<string, unknown>): Promise<{ data?: { wallets?: CircleWallet[] } }>;
  getWallet(input: { id: string }): Promise<{ data?: { wallet?: CircleWallet } }>;
  getWalletTokenBalance(input: { id: string }): Promise<{ data?: { tokenBalances?: Array<{ token?: { symbol?: string; blockchain?: string }; amount?: string }> } }>;
  listTransactions(input: Record<string, unknown>): Promise<{ data?: { transactions?: Array<Record<string, unknown>> } }>;
  getTransaction(input: { id: string }): Promise<{ data?: { transaction?: Record<string, unknown> } }>;
};
type CircleFactory = (input: { apiKey: string; entitySecret: string }) => CircleClient;

const blockchainFor = (environment: CapitalEnvironment): CapitalNetwork => environment === 'production' ? 'BASE' : 'BASE-SEPOLIA';
function safeProviderFailure(): ApiError { return new ApiError(503, 'provider_unavailable', 'Capital provider is temporarily unavailable'); }
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
  async createTransfer(): Promise<ProviderTransaction> {
    if (!this.liveExecutionEnabled) throw new ApiError(403, 'provider_execution_disabled', 'Circle transfer execution is disabled');
    throw new ApiError(503, 'provider_execution_unimplemented', 'Circle transfer submission is not implemented in this runtime');
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
