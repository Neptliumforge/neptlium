import { cn } from './utils/cn';

export type FinancialAvailability = 'ready' | 'unavailable' | 'pending' | 'masked';

export function Money({
  value,
  currency = 'USD',
  state = 'ready',
  className,
}: {
  readonly value?: number | null;
  readonly currency?: string;
  readonly state?: FinancialAvailability;
  readonly className?: string;
}) {
  const content =
    state === 'masked'
      ? '••••'
      : state === 'pending'
        ? 'Pending'
        : state === 'unavailable' || value == null
          ? '$—'
          : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  return <span className={cn('font-mono tabular-nums', className)}>{content}</span>;
}

export function AssetAmount({
  value,
  asset,
  state = 'ready',
  className,
}: {
  readonly value?: number | null;
  readonly asset: 'USDC' | 'ETH' | 'BTC';
  readonly state?: FinancialAvailability;
  readonly className?: string;
}) {
  const precision = asset === 'BTC' ? 8 : asset === 'ETH' ? 6 : 2;
  const content =
    state !== 'ready' || value == null
      ? `— ${asset}`
      : `${value.toLocaleString('en-US', { maximumFractionDigits: precision })} ${asset}`;
  return <span className={cn('font-mono tabular-nums', className)}>{content}</span>;
}
