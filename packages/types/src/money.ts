export interface Money {
  /** Integer amount in the smallest persisted unit. Never a floating-point value. */
  readonly amountAtomic: string;
  /** Decimal scale used to render amountAtomic. USD cents = 2, USDC = 6. */
  readonly scale: number;
  /** Explicit fiat currency code or canonical asset key/symbol. */
  readonly currencyOrAsset: string;
}

export interface MoneyDisplay {
  readonly amount: string;
  readonly currencyOrAsset: string;
}

export interface AtomicAssetAmount {
  readonly amountAtomic: string;
  readonly assetKey: string;
  readonly decimals: number;
}
