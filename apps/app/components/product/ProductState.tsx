import type { ReactNode } from 'react';
import { Badge } from '@neptlium/ui';

export type ProductStateName =
  | 'LOADING'
  | 'AVAILABLE'
  | 'READY'
  | 'PENDING'
  | 'AWAITING_PROVISIONING'
  | 'CAPABILITY_DISABLED'
  | 'RESERVED'
  | 'RESTRICTED'
  | 'NOT_CONFIGURED'
  | 'INELIGIBLE'
  | 'UNAVAILABLE'
  | 'NO_ACTIVITY'
  | 'NO_POSITION'
  | 'REQUIRES_APPROVAL'
  | 'ERROR';

export type BackendCapabilityState = 'ENABLED' | 'DISABLED' | 'NOT_CONFIGURED' | 'INELIGIBLE';

export function productStateFromCapability(state: BackendCapabilityState): ProductStateName {
  if (state === 'ENABLED') return 'READY';
  if (state === 'INELIGIBLE') return 'INELIGIBLE';
  if (state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED';
  return 'CAPABILITY_DISABLED';
}

const labels: Record<ProductStateName, string> = {
  LOADING: 'Loading',
  AVAILABLE: 'Available',
  READY: 'Ready',
  PENDING: 'Pending',
  AWAITING_PROVISIONING: 'Setting up',
  CAPABILITY_DISABLED: 'Disabled',
  RESERVED: 'Reserved',
  RESTRICTED: 'Restricted',
  NOT_CONFIGURED: 'Not configured',
  INELIGIBLE: 'Ineligible',
  UNAVAILABLE: 'Unavailable',
  NO_ACTIVITY: 'No activity',
  NO_POSITION: 'No position',
  REQUIRES_APPROVAL: 'Approval required',
  ERROR: 'Error',
};

const descriptions: Partial<Record<ProductStateName, string>> = {
  AWAITING_PROVISIONING: 'Your account is still being prepared. Try again shortly.',
  CAPABILITY_DISABLED: 'This action is not currently available for your account.',
  NOT_CONFIGURED: 'This feature is not currently available for your account.',
  UNAVAILABLE: 'This information is temporarily unavailable. Try again shortly.',
  NO_ACTIVITY: 'There is no activity in this section yet.',
  NO_POSITION: 'There are no positions in this section yet.',
  ERROR: 'We could not load this information. Your existing account state is unchanged.',
};

const tones: Record<ProductStateName, 'success' | 'warning' | 'danger' | 'neutral'> = {
  LOADING: 'neutral',
  AVAILABLE: 'success',
  READY: 'success',
  PENDING: 'warning',
  AWAITING_PROVISIONING: 'neutral',
  CAPABILITY_DISABLED: 'neutral',
  RESERVED: 'warning',
  RESTRICTED: 'warning',
  NOT_CONFIGURED: 'neutral',
  INELIGIBLE: 'warning',
  UNAVAILABLE: 'neutral',
  NO_ACTIVITY: 'neutral',
  NO_POSITION: 'neutral',
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
  const body = children ?? descriptions[state];

  return (
    <div className={compact ? 'py-3' : 'py-5'} role={state === 'ERROR' ? 'alert' : state === 'LOADING' ? 'status' : undefined} aria-live={state === 'LOADING' ? 'polite' : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-text-primary">{title ?? labels[state]}</p>
        <ProductStateBadge state={state} />
      </div>
      {body ? <div className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">{body}</div> : null}
    </div>
  );
}

export function formatAtomicAmount(value: string, asset: string, decimals?: number): string {
  if (decimals === undefined || !Number.isInteger(decimals) || decimals < 0 || !/^-?\d+$/.test(value)) {
    return `${value} atomic ${asset}`;
  }

  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;
  const padded = digits.padStart(decimals + 1, '0');
  const whole = decimals ? padded.slice(0, -decimals) || '0' : padded;
  const fraction = decimals ? padded.slice(-decimals).replace(/0+$/, '') : '';
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = `${negative ? '-' : ''}${formattedWhole}${fraction ? `.${fraction}` : ''}`;

  return asset === 'USD' ? `${number} USD` : `${number} ${asset}`;
}

export function FinancialValue({
  valueAtomic,
  asset,
  decimals,
  unavailableLabel = 'Not reported',
  className = '',
}: {
  readonly valueAtomic?: string | null;
  readonly asset?: string | null;
  readonly decimals?: number | null;
  readonly unavailableLabel?: string;
  readonly className?: string;
}) {
  if (valueAtomic === undefined || valueAtomic === null || !asset) {
    return <span className={`text-text-primary ${className}`}>{unavailableLabel}</span>;
  }
  return <span className={`tabular-nums text-text-primary ${className}`}>{formatAtomicAmount(valueAtomic, asset, decimals ?? undefined)}</span>;
}
