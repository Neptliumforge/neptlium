/**
 * Deposit service contract.
 * Current production capability: USD wire only (InternalLedgerCustodyProvider).
 * Crypto deposits: not yet available.
 */
export type DepositMethodType = "crypto";
export type DepositMethodStatus = "available" | "coming_soon" | "unavailable" | "restricted";

export interface DepositMethod {
  readonly type: DepositMethodType;
  readonly label: string;
  readonly description: string;
  readonly status: DepositMethodStatus;
  readonly currency?: string;
}

export interface DepositDestination {
  readonly id: string;
  readonly asset: string;
  readonly network: string;
  readonly address: string; // wire reference like NLM-XXXXXXXX, or blockchain address
  readonly status: string;
  readonly createdAt: string;
}

export interface DepositService {
  getDepositMethods(): Promise<readonly DepositMethod[]>;
  getSupportedAssets(): Promise<readonly { code: string; label: string }[]>;
  getSupportedNetworks(asset: string): Promise<readonly { code: string; label: string }[]>;
  getDepositDestinations(walletId: string): Promise<readonly DepositDestination[]>;
  createDepositDestination(walletId: string, profileId: string, asset: string, network: string): Promise<DepositDestination>;
}
