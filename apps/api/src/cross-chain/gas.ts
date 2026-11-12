/** Non-executing gas diagnostics. Inputs must come from separately verified chain observations. */
export type GasDiagnosticInput = Readonly<{
  nativeBalanceWei: bigint;
  estimatedGasWei: bigint | null;
  sponsorshipVerified: boolean;
}>;
export type GasDiagnostic = Readonly<{
  status: 'UNKNOWN' | 'SPONSORED' | 'SUFFICIENT' | 'INSUFFICIENT';
  shortfallWei: string | null;
  executionAuthorized: false;
}>;
export function diagnoseSourceGas(input: GasDiagnosticInput): GasDiagnostic {
  if (input.nativeBalanceWei < 0n || (input.estimatedGasWei !== null && input.estimatedGasWei < 0n)) {
    throw new Error('Negative gas values are invalid');
  }
  if (input.sponsorshipVerified) return Object.freeze({ status: 'SPONSORED', shortfallWei: null, executionAuthorized: false });
  if (input.estimatedGasWei === null) return Object.freeze({ status: 'UNKNOWN', shortfallWei: null, executionAuthorized: false });
  const shortfall = input.estimatedGasWei - input.nativeBalanceWei;
  return Object.freeze({
    status: shortfall > 0n ? 'INSUFFICIENT' : 'SUFFICIENT',
    shortfallWei: shortfall > 0n ? shortfall.toString() : '0',
    executionAuthorized: false,
  });
}
