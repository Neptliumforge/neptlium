export type TreasuryAccountType =
  | 'external_wallet'
  | 'zengo_treasury'
  | 'smart_account'
  | 'watch_only'
  | 'circle_managed_account'
  | 'stripe_balance_account'
  | 'bank_account';

export type TreasuryPaymentRail =
  | 'stablecoin_onchain'
  | 'circle_transfer'
  | 'stripe_card'
  | 'stripe_bank'
  | 'stripe_checkout'
  | 'future_bank_rail';

export type TreasuryIntentType = 'payment' | 'treasury_transfer' | 'receipt' | 'refund' | 'contract_interaction';

export type TreasuryIntentState =
  | 'draft'
  | 'preflight'
  | 'policy_checked'
  | 'awaiting_approval'
  | 'approved'
  | 'awaiting_execution'
  | 'awaiting_signature'
  | 'signed'
  | 'broadcast'
  | 'confirming'
  | 'confirmed'
  | 'processing'
  | 'settling'
  | 'settled'
  | 'reconciled'
  | 'rejected'
  | 'cancelled'
  | 'failed_preflight'
  | 'failed_policy'
  | 'failed_provider'
  | 'signature_expired'
  | 'transaction_reverted'
  | 'payment_failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed'
  | 'dropped'
  | 'replaced';

export interface TreasuryMoney {
  readonly amountAtomic: string;
  readonly scale: number;
  readonly currencyOrAsset: string;
}

export interface TreasuryAccountRef {
  readonly id: string;
  readonly organizationId: string;
  readonly displayName: string;
  readonly accountType: TreasuryAccountType;
  readonly provider: 'external' | 'zengo' | 'alchemy' | 'circle' | 'stripe' | 'bank';
  readonly purpose: string;
  readonly signingMode: 'external' | 'smart_account' | 'provider_managed' | 'not_applicable';
  readonly status: 'active' | 'inactive' | 'restricted';
}

export interface TreasuryTransactionIntent {
  readonly id: string;
  readonly organizationId: string;
  readonly sourceAccountId: string;
  readonly type: TreasuryIntentType;
  readonly status: TreasuryIntentState;
  readonly money: TreasuryMoney;
  readonly destination: string;
  readonly counterpartyId?: string;
  readonly networkId?: string;
  readonly paymentRail?: TreasuryPaymentRail;
  readonly memo?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const treasuryNetworks = {
  ethereum: { chainId: 1, family: 'evm', enabledByDefault: true },
  arbitrum: { chainId: 42161, family: 'evm', enabledByDefault: true },
  optimism: { chainId: 10, family: 'evm', enabledByDefault: true },
  polygon: { chainId: 137, family: 'evm', enabledByDefault: true },
  base: { chainId: 8453, family: 'evm', enabledByDefault: false },
} as const;

export type TreasuryNetworkId = keyof typeof treasuryNetworks;

export function normalizeTreasuryMoney(input: TreasuryMoney): TreasuryMoney {
  if (!/^\d+$/.test(input.amountAtomic)) throw new Error('money amount must be an unsigned integer in atomic units');
  if (!Number.isInteger(input.scale) || input.scale < 0 || input.scale > 36) throw new Error('money scale is out of range');
  const currencyOrAsset = input.currencyOrAsset.trim().toUpperCase();
  if (!/^[A-Z0-9._:-]{2,128}$/.test(currencyOrAsset)) throw new Error('money currency or asset identity is invalid');
  return { amountAtomic: BigInt(input.amountAtomic).toString(), scale: input.scale, currencyOrAsset };
}

export function formatTreasuryMoney(input: TreasuryMoney): string {
  const money = normalizeTreasuryMoney(input);
  if (money.scale === 0) return money.amountAtomic;
  const padded = money.amountAtomic.padStart(money.scale + 1, '0');
  const split = padded.length - money.scale;
  return `${padded.slice(0, split)}.${padded.slice(split)}`;
}

const transitions: Readonly<Record<TreasuryIntentState, readonly TreasuryIntentState[]>> = {
  draft: ['preflight', 'cancelled'],
  preflight: ['policy_checked', 'failed_preflight', 'cancelled'],
  policy_checked: ['awaiting_approval', 'approved', 'failed_policy', 'cancelled'],
  awaiting_approval: ['approved', 'rejected', 'cancelled'],
  approved: ['awaiting_execution', 'cancelled'],
  awaiting_execution: ['awaiting_signature', 'processing', 'failed_provider', 'cancelled'],
  awaiting_signature: ['signed', 'signature_expired', 'cancelled'],
  signed: ['broadcast', 'processing', 'failed_provider'],
  broadcast: ['confirming', 'failed_provider', 'dropped', 'replaced'],
  confirming: ['confirmed', 'transaction_reverted', 'failed_provider', 'dropped', 'replaced'],
  confirmed: ['settling'],
  processing: ['settling', 'payment_failed', 'failed_provider'],
  settling: ['settled', 'failed_provider'],
  settled: ['reconciled', 'refunded', 'partially_refunded', 'disputed'],
  reconciled: ['refunded', 'partially_refunded', 'disputed'],
  rejected: [],
  cancelled: [],
  failed_preflight: [],
  failed_policy: [],
  failed_provider: [],
  signature_expired: [],
  transaction_reverted: [],
  payment_failed: [],
  refunded: [],
  partially_refunded: ['refunded', 'disputed'],
  disputed: [],
  dropped: ['replaced'],
  replaced: ['confirming', 'failed_provider'],
};

export function canTransitionTreasuryIntent(from: TreasuryIntentState, to: TreasuryIntentState): boolean {
  return transitions[from].includes(to);
}

export function requireTreasuryIntentTransition(from: TreasuryIntentState, to: TreasuryIntentState): void {
  if (!canTransitionTreasuryIntent(from, to)) throw new Error(`invalid treasury intent transition: ${from} -> ${to}`);
}
