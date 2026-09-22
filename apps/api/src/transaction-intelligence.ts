export type TransactionSemanticKind =
  | 'deposit'
  | 'withdrawal'
  | 'swap'
  | 'self_transfer'
  | 'contract_interaction'
  | 'unclassified';

export type TransactionDirection = 'in' | 'out' | 'self';

export interface ObservedTransferLeg {
  network: string;
  txHash: string;
  from: string;
  to: string;
  asset: string;
  amountAtomic: string;
  observedAt: string;
  tokenContract?: string | null;
  tokenDecimals?: number | null;
  logIndex?: number | null;
}

export interface ClassifiedTransferLeg extends ObservedTransferLeg {
  direction: TransactionDirection;
  reconciliationKey: string;
}

export interface TransactionIntelligence {
  txHash: string;
  network: string;
  walletAddress: string;
  kind: TransactionSemanticKind;
  confidence: 'high' | 'medium' | 'low';
  canonical: false;
  legs: ClassifiedTransferLeg[];
  observedAt: string;
  summary: string;
}

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const EVM_TRANSACTION = /^0x[0-9a-fA-F]{64}$/;

function normalizeAddress(value: string, label: string): string {
  if (!EVM_ADDRESS.test(value)) throw new Error(`${label} is not a valid EVM address`);
  return value.toLowerCase();
}

function normalizeTransactionHash(value: string): string {
  if (!EVM_TRANSACTION.test(value)) throw new Error('Transaction hash is not a valid EVM transaction hash');
  return value.toLowerCase();
}

function assertAtomicAmount(value: string): void {
  if (!/^\d+$/.test(value) || BigInt(value) <= 0n)
    throw new Error('Observed transfer amount must be a positive atomic integer');
}

function assetIdentity(leg: ObservedTransferLeg): string {
  return `${leg.network.toUpperCase()}:${leg.tokenContract?.toLowerCase() ?? `native:${leg.asset.toUpperCase()}`}`;
}

export function reconciliationKey(leg: ObservedTransferLeg): string {
  const txHash = normalizeTransactionHash(leg.txHash);
  const position = leg.logIndex === undefined || leg.logIndex === null ? 'native' : String(leg.logIndex);
  return `${leg.network.toUpperCase()}:${txHash}:${position}:${assetIdentity(leg)}`;
}

/**
 * Converts observation-only transfer evidence into a human-facing semantic
 * interpretation. The output is deliberately non-canonical: it cannot settle a
 * transaction, mutate a ledger, prove cost basis, or authorize movement of funds.
 */
export function classifyObservedTransaction(input: {
  walletAddress: string;
  legs: ObservedTransferLeg[];
}): TransactionIntelligence {
  if (input.legs.length === 0) throw new Error('At least one observed transfer leg is required');

  const walletAddress = normalizeAddress(input.walletAddress, 'Wallet address');
  const firstHash = normalizeTransactionHash(input.legs[0]!.txHash);
  const firstNetwork = input.legs[0]!.network.toUpperCase();

  const normalized = input.legs.map<ClassifiedTransferLeg>((leg) => {
    const txHash = normalizeTransactionHash(leg.txHash);
    if (txHash !== firstHash) throw new Error('All transfer legs must belong to the same transaction');
    if (leg.network.toUpperCase() !== firstNetwork)
      throw new Error('All transfer legs must belong to the same network');
    if (!Number.isFinite(Date.parse(leg.observedAt))) throw new Error('Observed transfer timestamp is invalid');
    assertAtomicAmount(leg.amountAtomic);

    const from = normalizeAddress(leg.from, 'Transfer sender');
    const to = normalizeAddress(leg.to, 'Transfer recipient');
    const direction: TransactionDirection =
      from === walletAddress && to === walletAddress
        ? 'self'
        : to === walletAddress
          ? 'in'
          : from === walletAddress
            ? 'out'
            : (() => {
                throw new Error('Observed transfer leg does not involve the wallet');
              })();

    return {
      ...leg,
      network: firstNetwork,
      txHash,
      from,
      to,
      direction,
      reconciliationKey: reconciliationKey({ ...leg, network: firstNetwork, txHash }),
    };
  });

  const incoming = normalized.filter((leg) => leg.direction === 'in');
  const outgoing = normalized.filter((leg) => leg.direction === 'out');
  const self = normalized.filter((leg) => leg.direction === 'self');
  const incomingAssets = new Set(incoming.map(assetIdentity));
  const outgoingAssets = new Set(outgoing.map(assetIdentity));
  const hasAssetExchange = [...incomingAssets].some((asset) => !outgoingAssets.has(asset)) ||
    [...outgoingAssets].some((asset) => !incomingAssets.has(asset));

  let kind: TransactionSemanticKind;
  let confidence: TransactionIntelligence['confidence'];
  let summary: string;

  if (self.length === normalized.length) {
    kind = 'self_transfer';
    confidence = 'high';
    summary = 'Assets moved within the same wallet address.';
  } else if (incoming.length > 0 && outgoing.length === 0) {
    kind = 'deposit';
    confidence = 'high';
    summary = `Received ${incoming.length} observed asset transfer${incoming.length === 1 ? '' : 's'}.`;
  } else if (outgoing.length > 0 && incoming.length === 0) {
    kind = 'withdrawal';
    confidence = 'high';
    summary = `Sent ${outgoing.length} observed asset transfer${outgoing.length === 1 ? '' : 's'}.`;
  } else if (incoming.length > 0 && outgoing.length > 0 && hasAssetExchange) {
    kind = 'swap';
    confidence = 'medium';
    summary = 'Observed outgoing and incoming assets suggest an asset exchange.';
  } else if (incoming.length > 0 && outgoing.length > 0) {
    kind = 'contract_interaction';
    confidence = 'low';
    summary = 'Observed bidirectional asset movement requires additional protocol context.';
  } else {
    kind = 'unclassified';
    confidence = 'low';
    summary = 'Observed transaction could not be classified from transfer evidence alone.';
  }

  const observedAt = normalized
    .map((leg) => leg.observedAt)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0]!;

  return {
    txHash: firstHash,
    network: firstNetwork,
    walletAddress,
    kind,
    confidence,
    canonical: false,
    legs: normalized,
    observedAt,
    summary,
  };
}
