import type { ProviderEnvironment, SettlementEvidence } from './funding-domain.js';

export interface AlchemyTransferObservation {
  txHash: string;
  asset: string;
  network: string;
  from: string;
  to: string;
  amountAtomic: string;
  blockNumber?: string;
  confirmations?: number;
}

/**
 * Alchemy is deliberately observation-only. This adapter can normalize indexed
 * chain evidence but cannot authorize, execute, custody, post ledger entries or
 * decide canonical availability.
 */
export function normalizeAlchemyObservation(
  observation: AlchemyTransferObservation,
  environment: ProviderEnvironment,
): SettlementEvidence {
  return {
    source: 'ALCHEMY',
    environment,
    asset: observation.asset,
    network: observation.network,
    amountAtomic: observation.amountAtomic,
    address: observation.to,
    txHash: observation.txHash,
    ...(observation.confirmations === undefined ? {} : { confirmations: observation.confirmations }),
    state: 'observed',
  };
}
