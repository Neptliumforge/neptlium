/** Provider-neutral, untrusted quote normalization. Never confers execution authority. */
export type BridgeQuoteInput = Readonly<{
  providerId: string;
  sourceChainId: number;
  destinationChainId: number;
  inputAmountBaseUnits: string;
  outputAmountBaseUnits: string;
  feeAmountBaseUnits: string;
  expiresAt: string;
}>;
export type BridgeQuotePreview = Readonly<BridgeQuoteInput & { executionAuthorized: false; status: 'UNVERIFIED_QUOTE' }>;
const UINT = /^(?:0|[1-9][0-9]*)$/;
function positiveAmount(value: string, allowZero = false): bigint {
  if (!UINT.test(value)) throw new Error('Invalid quote amount');
  const n = BigInt(value);
  if ((!allowZero && n === 0n) || n > 2n ** 256n - 1n) throw new Error('Invalid quote amount');
  return n;
}
export function previewBridgeQuote(input: BridgeQuoteInput, now: Date = new Date()): BridgeQuotePreview {
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(input.providerId)) throw new Error('Invalid provider identifier');
  if (input.sourceChainId !== 42161 || input.destinationChainId !== 8453) throw new Error('Unsupported quote route');
  const amount = positiveAmount(input.inputAmountBaseUnits);
  const output = positiveAmount(input.outputAmountBaseUnits);
  const fee = positiveAmount(input.feeAmountBaseUnits, true);
  if (output > amount || fee > amount) throw new Error('Quote exceeds input amount');
  const expiry = Date.parse(input.expiresAt);
  if (!Number.isFinite(expiry) || !/Z$/.test(input.expiresAt) || expiry <= now.getTime()) throw new Error('Expired or invalid quote');
  return Object.freeze({ ...input, status: 'UNVERIFIED_QUOTE', executionAuthorized: false });
}
