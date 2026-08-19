import type { ProviderEnvironment, SettlementEvidence } from './funding-domain.js';

export interface AlchemyTransferObservation {
  chainId: number;
  txHash: string;
  asset: string;
  network: string;
  from: string;
  to: string;
  amountAtomic: string;
  receiptPresent: boolean;
  receiptStatus: 'SUCCESS' | 'REVERTED' | 'UNKNOWN';
  blockNumber?: string;
  blockHash?: string;
  confirmations?: number;
  transferType: 'NATIVE' | 'ERC20';
  tokenContract?: string;
  tokenDecimals?: number;
  logIndex?: number;
}

export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_MAINNET_USDC_CONTRACT = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

/**
 * Alchemy is deliberately observation-only. This adapter can normalize indexed
 * chain evidence but cannot authorize, execute, custody, post ledger entries or
 * decide canonical availability.
 */
export function normalizeAlchemyObservation(
  observation: AlchemyTransferObservation,
  environment: ProviderEnvironment,
): SettlementEvidence {
  if (environment === 'LIVE' && observation.chainId !== BASE_MAINNET_CHAIN_ID)
    throw new Error('Alchemy Base observation chain mismatch');
  if (!observation.receiptPresent || observation.receiptStatus !== 'SUCCESS')
    throw new Error('Alchemy observation lacks a successful transaction receipt');
  if (!observation.blockHash || !observation.blockNumber)
    throw new Error('Alchemy observation lacks durable block identity');
  if (observation.transferType === 'ERC20') {
    if (
      !observation.tokenContract ||
      observation.logIndex === undefined ||
      observation.tokenDecimals === undefined
    )
      throw new Error('Alchemy ERC-20 observation lacks contract, decimals, or log identity');
    if (
      observation.asset === 'USDC' &&
      observation.tokenContract.toLowerCase() !== BASE_MAINNET_USDC_CONTRACT
    )
      throw new Error('Alchemy USDC observation is not the canonical Base USDC contract');
  }
  return {
    source: 'ALCHEMY',
    environment,
    asset: observation.asset,
    network: observation.network,
    amountAtomic: observation.amountAtomic,
    address: observation.to,
    txHash: observation.txHash,
    ...(observation.confirmations === undefined
      ? {}
      : { confirmations: observation.confirmations }),
    state: 'observed',
  };
}
