import { createHash, randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';

export const supportedPairs = [
  'USDC:base-sepolia',
  'ETH:base-sepolia',
  'BTC:bitcoin-testnet',
] as const;
export type Asset = 'USDC' | 'ETH' | 'BTC';
export type Network = 'base-sepolia' | 'bitcoin-testnet';
export type DepositState =
  'detected' | 'confirming' | 'confirmed' | 'credited' | 'reorged' | 'failed' | 'ignored';
export type WithdrawalState =
  | 'requested'
  | 'validating'
  | 'held'
  | 'approved'
  | 'signing'
  | 'submitted'
  | 'confirming'
  | 'settled'
  | 'cancelled'
  | 'failed'
  | 'reversed';

const depositTransitions: Record<DepositState, DepositState[]> = {
  detected: ['confirming', 'ignored', 'failed'],
  confirming: ['confirmed', 'reorged', 'failed'],
  confirmed: ['credited', 'reorged', 'failed'],
  credited: ['reorged'],
  reorged: [],
  failed: [],
  ignored: [],
};
const withdrawalTransitions: Record<WithdrawalState, WithdrawalState[]> = {
  requested: ['validating', 'cancelled', 'failed'],
  validating: ['held', 'approved', 'cancelled', 'failed'],
  held: ['approved', 'cancelled', 'failed'],
  approved: ['signing', 'cancelled', 'failed'],
  signing: ['submitted', 'failed'],
  submitted: ['confirming', 'failed'],
  confirming: ['settled', 'failed', 'reversed'],
  settled: ['reversed'],
  cancelled: [],
  failed: [],
  reversed: [],
};

export function transition<T extends DepositState | WithdrawalState>(
  kind: 'deposit' | 'withdrawal',
  from: T,
  to: T,
): T {
  const map = kind === 'deposit' ? depositTransitions : withdrawalTransitions;
  if (!(map as Record<string, string[]>)[from]?.includes(to)) {
    throw new ApiError(
      409,
      'invalid_state_transition',
      `Cannot transition ${kind} from ${from} to ${to}`,
    );
  }
  return to;
}

export function validatePair(asset: Asset, network: Network) {
  if (!supportedPairs.includes(`${asset}:${network}` as (typeof supportedPairs)[number])) {
    throw new ApiError(422, 'validation_failed', 'Unsupported asset and network combination');
  }
}

export interface Posting {
  accountId: string;
  side: 'debit' | 'credit';
  amount: bigint;
  asset: Asset;
  network: Network;
}
export interface LedgerEntry {
  id: string;
  eventType: string;
  reference: string;
  postings: readonly Posting[];
  createdAt: string;
}

export class Ledger {
  readonly entries: LedgerEntry[] = [];
  post(input: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    if (input.postings.length < 2 || input.postings.some((p) => p.amount <= 0n))
      throw new ApiError(422, 'validation_failed', 'Ledger postings must have positive amounts');
    for (const pair of supportedPairs) {
      const [asset, network] = pair.split(':');
      const matching = input.postings.filter((p) => p.asset === asset && p.network === network);
      const debit = matching
        .filter((p) => p.side === 'debit')
        .reduce((sum, p) => sum + p.amount, 0n);
      const credit = matching
        .filter((p) => p.side === 'credit')
        .reduce((sum, p) => sum + p.amount, 0n);
      if (debit !== credit)
        throw new ApiError(422, 'validation_failed', 'Ledger entry is not balanced');
    }
    const entry = Object.freeze({
      ...input,
      postings: Object.freeze([...input.postings]),
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    });
    this.entries.push(entry);
    return entry;
  }
  balance(accountId: string, asset: Asset, network: Network): bigint {
    return this.entries
      .flatMap((entry) => entry.postings)
      .filter((p) => p.accountId === accountId && p.asset === asset && p.network === network)
      .reduce(
        (sum, posting) => sum + (posting.side === 'credit' ? posting.amount : -posting.amount),
        0n,
      );
  }
}

export function digest(value: unknown) {
  return createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
}
