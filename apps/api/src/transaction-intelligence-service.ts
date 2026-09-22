import { createHash } from 'node:crypto';
import {
  classifyObservedTransaction,
  reconciliationKey,
  type ObservedTransferLeg,
} from './transaction-intelligence.js';
import type {
  TransactionIntelligenceRepository,
  TransactionSemanticEventRecord,
} from './transaction-intelligence-repository.js';

function digest(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function stableLeg(leg: ObservedTransferLeg) {
  return {
    network: leg.network.toUpperCase(),
    txHash: leg.txHash.toLowerCase(),
    from: leg.from.toLowerCase(),
    to: leg.to.toLowerCase(),
    asset: leg.asset.toUpperCase(),
    amountAtomic: leg.amountAtomic,
    observedAt: leg.observedAt,
    tokenContract: leg.tokenContract?.toLowerCase() ?? null,
    tokenDecimals: leg.tokenDecimals ?? null,
    logIndex: leg.logIndex ?? null,
  };
}

export function transactionObservationIdentity(input: {
  walletAddress: string;
  legs: ObservedTransferLeg[];
}) {
  if (input.legs.length === 0) throw new Error('At least one observed transfer leg is required');
  const legKeys = input.legs.map(reconciliationKey).sort();
  return digest(`${input.walletAddress.toLowerCase()}|${legKeys.join('|')}`);
}

export function transactionObservationDigest(input: {
  walletAddress: string;
  legs: ObservedTransferLeg[];
}) {
  const stable = input.legs.map(stableLeg).sort((a, b) => {
    const aKey = `${a.logIndex ?? -1}:${a.asset}:${a.from}:${a.to}:${a.amountAtomic}`;
    const bKey = `${b.logIndex ?? -1}:${b.asset}:${b.from}:${b.to}:${b.amountAtomic}`;
    return aKey.localeCompare(bKey);
  });
  return digest(JSON.stringify({ walletAddress: input.walletAddress.toLowerCase(), legs: stable }));
}

/**
 * Observation ingestion deliberately stops at read-side semantic persistence.
 * It does not call provider execution, transfer lifecycle, settlement, journal,
 * posting, balance, or reservation code.
 */
export class TransactionIntelligenceService {
  constructor(private readonly repository: TransactionIntelligenceRepository) {}

  async ingest(input: {
    ownerId: string;
    walletAddress: string;
    source: string;
    sourceEventId: string;
    legs: ObservedTransferLeg[];
  }): Promise<{ event: TransactionSemanticEventRecord; replayed: boolean }> {
    const intelligence = classifyObservedTransaction({
      walletAddress: input.walletAddress,
      legs: input.legs,
    });
    const observation = await this.repository.ingestObservation({
      ownerId: input.ownerId,
      walletAddress: intelligence.walletAddress,
      network: intelligence.network,
      txHash: intelligence.txHash,
      source: input.source,
      sourceEventId: input.sourceEventId,
      reconciliationKey: transactionObservationIdentity({
        walletAddress: intelligence.walletAddress,
        legs: intelligence.legs,
      }),
      payloadDigest: transactionObservationDigest({
        walletAddress: intelligence.walletAddress,
        legs: intelligence.legs,
      }),
      observedAt: intelligence.observedAt,
    });
    const classified = await this.repository.persistClassification({
      observationId: observation.value.id,
      ownerId: input.ownerId,
      intelligence,
    });
    return {
      event: classified.value,
      replayed: observation.replayed || classified.replayed,
    };
  }
}
