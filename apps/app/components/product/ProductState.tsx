import type { ReactNode } from 'react';
import { Badge } from '@neptlium/ui';

export type ProductStateName =
  | 'AVAILABLE'
  | 'READY'
  | 'PENDING'
  | 'RESERVED'
  | 'RESTRICTED'
  | 'NOT_CONFIGURED'
  | 'INELIGIBLE'
  | 'UNAVAILABLE'
  | 'NO_ACTIVITY'
  | 'REQUIRES_APPROVAL'
  | 'ERROR';

const labels: Record<ProductStateName, string> = {
  AVAILABLE: 'Available',
  READY: 'Ready',
  PENDING: 'Pending',
  RESERVED: 'Reserved',
  RESTRICTED: 'Restricted',
  NOT_CONFIGURED: 'Not configured',
  INELIGIBLE: 'Ineligible',
  UNAVAILABLE: 'Unavailable',
  NO_ACTIVITY: 'No activity',
  REQUIRES_APPROVAL: 'Approval required',
  ERROR: 'Error',
};

const tones: Record<ProductStateName, 'success' | 'warning' | 'danger' | 'neutral'> = {
  AVAILABLE: 'success',
  READY: 'success',
  PENDING: 'warning',
  RESERVED: 'warning',
  RESTRICTED: 'warning',
  NOT_CONFIGURED: 'neutral',
  INELIGIBLE: 'warning',
  UNAVAILABLE: 'neutral',
  NO_ACTIVITY: 'neutral',
  REQUIRES_APPROVAL: 'warning',
  ERROR: 'danger',
};

export function ProductStateBadge({ state, children }: { readonly state: ProductStateName; readonly children?: ReactNode }) {
  return <Badge tone={tones[state]}>{children ?? labels[state]}</Badge>;
}

export function ProductStateMessage({
  state,
  title,
  children,
  compact = false,
}: {
  readonly state: ProductStateName;
  readonly title?: string;
  readonly children?: ReactNode;
  readonly compact?: boolean;
}) {
  return (
    <div className={compact ? 'py-3' : 'py-5'} role={state === 'ERROR' ? 'alert' : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-text-primary">{title ?? labels[state]}</p>
        <ProductStateBadge state={state} />
      </div>
      {children ? <div className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">{children}</div> : null}
    </div>
  );
}

const atomicPrecision: Readonly<Record<string, number>> = {
  USD: 2,
  USDC: 6,
  ETH: 18,
  BTC: 8,
  XRP: 6,
};

export function formatAtomicAmount(value: string, asset: string): string {
  const precision = atomicPrecision[asset];
  if (precision === undefined || !/^-?\d+$/.test(value)) return `${value} atomic ${asset}`;

  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const padded = digits.padStart(precision + 1, '0');
  const whole = precision ? padded.slice(0, -precision) || '0' : padded;
  const fraction = precision ? padded.slice(-precision).replace(/0+$/, '') : '';
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = `${negative ? '-' : ''}${formattedWhole}${fraction ? `.${fraction}` : ''}`;

  return asset === 'USD' ? `${number} USD` : `${number} ${asset}`;
}

export function FinancialValue({
  valueAtomic,
  asset,
  unavailableLabel = 'Unavailable',
  className = '',
}: {
  readonly valueAtomic?: string | null;
  readonly asset?: string | null;
  readonly unavailableLabel?: string;
  readonly className?: string;
}) {
  if (valueAtomic === undefined || valueAtomic === null || !asset) {
    return <span className={`text-text-primary ${className}`}>{unavailableLabel}</span>;
  }
  return <span className={`tabular-nums text-text-primary ${className}`}>{formatAtomicAmount(valueAtomic, asset)}</span>;
}
