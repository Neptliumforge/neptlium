import type { ProviderEnvironment } from './funding-domain.js';

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
  observedAt: string;
  treasuryDestinationId: string;
  depositRouteId: string;
  fundingIntentId: string;
}

export interface NormalizedAlchemyEvidence {
  source: 'ALCHEMY';
  environment: ProviderEnvironment;
  asset: string;
  network: string;
  amountAtomic: string;
  address: string;
  txHash: string;
  state: 'observed';
  canonical: false;
  chainId: number;
  transactionHash: string;
  sender: string;
  recipient: string;
  receiptStatus: 'SUCCESS';
  blockNumber: string;
  blockHash: string;
  transferType: 'NATIVE' | 'ERC20';
  tokenContract: string | null;
  tokenDecimals: number | null;
  rawAtomicAmount: string;
  logIndex: number | null;
  confirmations: number | null;
  finalityState: 'UNCONFIRMED' | 'CONFIRMING';
  observedAt: string;
  treasuryDestinationId: string;
  depositRouteId: string;
  fundingIntentId: string;
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
): NormalizedAlchemyEvidence {
  if (environment === 'LIVE' && observation.chainId !== BASE_MAINNET_CHAIN_ID)
    throw new Error('Alchemy Base observation chain mismatch');
  if (!observation.receiptPresent || observation.receiptStatus !== 'SUCCESS')
    throw new Error('Alchemy observation lacks a successful transaction receipt');
  if (!observation.blockHash || !observation.blockNumber)
    throw new Error('Alchemy observation lacks durable block identity');
  if (observation.network !== 'BASE')
    throw new Error('Alchemy observation network is not Base mainnet');
  if (!/^0x[0-9a-fA-F]{64}$/.test(observation.txHash))
    throw new Error('Alchemy observation transaction hash is invalid');
  if (
    !/^0x[0-9a-fA-F]{40}$/.test(observation.from) ||
    !/^0x[0-9a-fA-F]{40}$/.test(observation.to)
  )
    throw new Error('Alchemy observation sender or recipient is invalid');
  if (!/^\d+$/.test(observation.amountAtomic) || BigInt(observation.amountAtomic) <= 0n)
    throw new Error('Alchemy observation atomic amount is invalid');
  if (
    !observation.treasuryDestinationId ||
    !observation.depositRouteId ||
    !observation.fundingIntentId
  )
    throw new Error('Alchemy observation lacks governed route correlation');
  if (!Number.isFinite(Date.parse(observation.observedAt)))
    throw new Error('Alchemy observation timestamp is invalid');
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
    if (observation.asset === 'USDC' && observation.tokenDecimals !== 6)
      throw new Error('Alchemy USDC observation has non-canonical decimals');
  } else if (observation.asset === 'USDC') {
    throw new Error('Alchemy USDC observation cannot be classified as a native transfer');
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
    canonical: false,
    chainId: observation.chainId,
    transactionHash: observation.txHash.toLowerCase(),
    sender: observation.from.toLowerCase(),
    recipient: observation.to.toLowerCase(),
    receiptStatus: 'SUCCESS',
    blockNumber: observation.blockNumber,
    blockHash: observation.blockHash.toLowerCase(),
    transferType: observation.transferType,
    tokenContract: observation.tokenContract?.toLowerCase() ?? null,
    tokenDecimals: observation.tokenDecimals ?? null,
    rawAtomicAmount: observation.amountAtomic,
    logIndex: observation.logIndex ?? null,
    confirmations: observation.confirmations ?? null,
    finalityState: (observation.confirmations ?? 0) > 0 ? 'CONFIRMING' : 'UNCONFIRMED',
    observedAt: observation.observedAt,
    treasuryDestinationId: observation.treasuryDestinationId,
    depositRouteId: observation.depositRouteId,
    fundingIntentId: observation.fundingIntentId,
  };
}
