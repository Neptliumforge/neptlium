/**
 * Neptlium Pay cross-chain intent foundation (non-executing).
 * No RPC, wallet signing, token approval, persistence or settlement authority.
 */
export const USDC_NETWORKS = Object.freeze({
  arbitrum: Object.freeze({ chainId: 42161, contract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 }),
  base: Object.freeze({ chainId: 8453, contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }),
} as const);

export type TransferIntentInput = Readonly<{
  sourceChainId: number;
  destinationChainId: number;
  sourceToken: string;
  destinationToken: string;
  sender: string;
  recipient: string;
  amountBaseUnits: string;
}>;

export type TransferIntentPreview = Readonly<TransferIntentInput & {
  asset: 'USDC';
  status: 'PREVIEW_ONLY';
  gasRequirement: 'UNKNOWN';
  executionAvailable: false;
}>;

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const INTEGER = /^(?:0|[1-9][0-9]*)$/;

export function createTransferIntentPreview(input: TransferIntentInput): TransferIntentPreview {
  if (input.sourceChainId !== USDC_NETWORKS.arbitrum.chainId ||
      input.destinationChainId !== USDC_NETWORKS.base.chainId) {
    throw new Error('Unsupported cross-chain route');
  }
  if (!EVM_ADDRESS.test(input.sender) || !EVM_ADDRESS.test(input.recipient)) {
    throw new Error('Invalid wallet address');
  }
  if (input.sourceToken.toLowerCase() !== USDC_NETWORKS.arbitrum.contract.toLowerCase() ||
      input.destinationToken.toLowerCase() !== USDC_NETWORKS.base.contract.toLowerCase()) {
    throw new Error('Unsupported USDC token contract');
  }
  if (!INTEGER.test(input.amountBaseUnits) || BigInt(input.amountBaseUnits) <= 0n ||
      BigInt(input.amountBaseUnits) > (2n ** 256n - 1n)) {
    throw new Error('Invalid exact-unit amount');
  }
  return Object.freeze({
    ...input,
    asset: 'USDC' as const,
    status: 'PREVIEW_ONLY' as const,
    gasRequirement: 'UNKNOWN' as const,
    executionAvailable: false as const,
  });
}
