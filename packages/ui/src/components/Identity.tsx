import type { ReactElement } from 'react';
import { cn } from './utils/cn';

export type IdentityCategory =
  | 'asset'
  | 'network'
  | 'company'
  | 'custodian'
  | 'exchange'
  | 'protocol'
  | 'provider'
  | 'product'
  | 'infrastructure';
export type IdentityId =
  'bitcoin' | 'ethereum' | 'usdc' | 'bitcoin-network' | 'ethereum-network' | 'base';
export interface EntityIdentity {
  readonly id: IdentityId;
  readonly name: string;
  readonly symbol?: string;
  readonly category: IdentityCategory;
  readonly accessibleLabel: string;
  readonly mark: 'bitcoin' | 'ethereum' | 'usdc' | 'base';
  readonly source: string;
  readonly contrast: 'native' | 'neutral-plate';
}

export const identityRegistry: Readonly<Record<IdentityId, EntityIdentity>> = {
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    category: 'asset',
    accessibleLabel: 'Bitcoin',
    mark: 'bitcoin',
    source: 'https://bitcoin.org/en/bitcoin-paper',
    contrast: 'native',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    category: 'asset',
    accessibleLabel: 'Ethereum',
    mark: 'ethereum',
    source: 'https://ethereum.org/en/assets/',
    contrast: 'neutral-plate',
  },
  usdc: {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    category: 'asset',
    accessibleLabel: 'USDC',
    mark: 'usdc',
    source: 'https://www.circle.com/usdc',
    contrast: 'native',
  },
  'bitcoin-network': {
    id: 'bitcoin-network',
    name: 'Bitcoin Network',
    category: 'network',
    accessibleLabel: 'Bitcoin Network',
    mark: 'bitcoin',
    source: 'https://bitcoin.org/',
    contrast: 'native',
  },
  'ethereum-network': {
    id: 'ethereum-network',
    name: 'Ethereum',
    category: 'network',
    accessibleLabel: 'Ethereum network',
    mark: 'ethereum',
    source: 'https://ethereum.org/en/assets/',
    contrast: 'neutral-plate',
  },
  base: {
    id: 'base',
    name: 'Base',
    category: 'network',
    accessibleLabel: 'Base network',
    mark: 'base',
    source: 'https://www.base.org/brand-kit',
    contrast: 'native',
  },
};

const assetAliases: Readonly<Record<string, IdentityId>> = {
  BTC: 'bitcoin',
  BITCOIN: 'bitcoin',
  ETH: 'ethereum',
  ETHEREUM: 'ethereum',
  USDC: 'usdc',
  'USD COIN': 'usdc',
};
const networkAliases: Readonly<Record<string, IdentityId>> = {
  BITCOIN: 'bitcoin-network',
  'BITCOIN NETWORK': 'bitcoin-network',
  BTC: 'bitcoin-network',
  ETHEREUM: 'ethereum-network',
  ETH: 'ethereum-network',
  BASE: 'base',
  'BASE MAINNET': 'base',
  'BASE-SEPOLIA': 'base',
  'BASE SEPOLIA': 'base',
  'BITCOIN-TESTNET': 'bitcoin-network',
  'BITCOIN TESTNET': 'bitcoin-network',
};
export function resolveAssetIdentity(value: string): EntityIdentity | null {
  const id = assetAliases[value.trim().toUpperCase()];
  return id ? identityRegistry[id] : null;
}
export function resolveNetworkIdentity(value: string): EntityIdentity | null {
  const id = networkAliases[value.trim().toUpperCase()];
  return id ? identityRegistry[id] : null;
}

const sizes = { xs: 'size-4', sm: 'size-5', md: 'size-7', lg: 'size-9', xl: 'size-12' } as const;
export type IdentitySize = keyof typeof sizes;

function Mark({ mark }: { readonly mark: EntityIdentity['mark'] }): ReactElement {
  if (mark === 'bitcoin')
    return (
      <svg viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          fill="#fff"
          d="M23.1 13.8c.3-2.2-1.4-3.4-3.7-4.2l.8-3-1.8-.5-.8 3-1.5-.4.8-3-1.8-.5-.8 3-1.2-.3-2.5-.6-.5 2 1.3.3c.7.2.8.6.8 1l-.9 3.5.2.1-.2-.1-1.3 4.9c-.1.2-.3.6-.8.4l-1.3-.3-.9 2.2 2.4.6 1.3.4-.8 3.1 1.8.5.8-3.1 1.5.4-.8 3.1 1.8.5.8-3.1c3.1.6 5.4.4 6.4-2.5.8-2.3 0-3.7-1.7-4.6 1.2-.3 2.1-1.1 2.4-2.8Zm-4.4 6.1c-.6 2.3-4.4 1-5.6.7l1-4.1c1.3.3 5.2 1 4.6 3.4Zm.6-6.2c-.5 2.1-3.7 1-4.8.7l.9-3.7c1.1.3 4.4.8 3.9 3Z"
        />
      </svg>
    );
  if (mark === 'ethereum')
    return (
      <svg viewBox="0 0 32 32">
        <path fill="#8C8C8C" d="M16 1 6.7 16.4 16 21.8l9.3-5.4L16 1Z" />
        <path fill="#343434" d="m16 1 9.3 15.4-9.3 5.4V1Z" />
        <path fill="#8C8C8C" d="m16 23.6-9.3-5.4L16 31V23.6Z" />
        <path fill="#3C3C3B" d="M16 31V23.6l9.3-5.4L16 31Z" />
        <path fill="#141414" d="m16 21.8 9.3-5.4-9.3-4.2v9.6Z" />
        <path fill="#393939" d="m6.7 16.4 9.3 5.4v-9.6l-9.3 4.2Z" />
      </svg>
    );
  if (mark === 'usdc')
    return (
      <svg viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path
          fill="#fff"
          d="M17.5 24.4v2h-2.2v-2c-3.5-.4-5.2-2.4-5.2-5h3c.1 1.5 1 2.5 3.4 2.5 1.8 0 2.8-.8 2.8-2 0-1.2-.6-1.7-3.1-2.1-3.8-.5-5.7-1.7-5.7-4.8 0-2.4 1.8-4.3 4.8-4.7v-2h2.2v2c2.8.4 4.5 2 4.8 4.6h-3c-.2-1.4-1-2.1-2.8-2.1-1.7 0-2.6.7-2.6 1.9 0 1.1.7 1.6 3 2 3.8.5 5.9 1.6 5.9 4.9 0 2.6-2 4.5-5.3 4.8Z"
        />
        <path
          fill="#fff"
          d="M8.6 25.3a12 12 0 0 1 0-18.6l1.5 1.7a9.7 9.7 0 0 0 0 15.2l-1.5 1.7Zm14.8 0-1.5-1.7a9.7 9.7 0 0 0 0-15.2l1.5-1.7a12 12 0 0 1 0 18.6Z"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#0052FF" />
      <path fill="#fff" d="M7 11h13.2a6 6 0 1 1 0 10H7v-3h13.2a3 3 0 1 0 0-4H7v-3Z" />
    </svg>
  );
}

export function IdentityMark({
  identity,
  size = 'md',
  decorative = false,
  className,
}: {
  readonly identity: EntityIdentity | null;
  readonly size?: IdentitySize;
  readonly decorative?: boolean;
  readonly className?: string;
}) {
  if (!identity)
    return (
      <span
        className={cn(
          'grid place-items-center rounded-sm bg-surface-3 text-text-muted',
          sizes[size],
          className,
        )}
        aria-label={decorative ? undefined : 'Unknown identity'}
        aria-hidden={decorative || undefined}
      >
        <svg viewBox="0 0 24 24" className="size-1/2" fill="none" stroke="currentColor">
          <path d="M5 5h5v5H5zm9 0h5v5h-5zM5 14h5v5H5zm9 0h5v5h-5z" />
        </svg>
      </span>
    );
  return (
    <span
      className={cn(
        'inline-flex shrink-0 [&>svg]:size-full',
        identity.contrast === 'neutral-plate' && 'rounded-full bg-white/90 p-[8%]',
        sizes[size],
        className,
      )}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : identity.accessibleLabel}
      aria-hidden={decorative || undefined}
    >
      <Mark mark={identity.mark} />
    </span>
  );
}

export function AssetIdentity({
  asset,
  network,
  size = 'md',
  detailed = false,
  className,
}: {
  readonly asset: string;
  readonly network?: string;
  readonly size?: IdentitySize;
  readonly detailed?: boolean;
  readonly className?: string;
}) {
  const identity = resolveAssetIdentity(asset);
  const networkIdentity = network ? resolveNetworkIdentity(network) : null;
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-3', className)}>
      <IdentityMark identity={identity} size={size} decorative />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-text-primary">
          {identity?.name ?? asset}
        </span>
        <span className="flex items-center gap-1.5 truncate text-xs text-text-muted">
          {detailed && identity?.symbol && <span>{identity.symbol}</span>}
          {detailed && identity?.symbol && network && <span aria-hidden="true">·</span>}
          {network && (
            <>
              {networkIdentity && <IdentityMark identity={networkIdentity} size="xs" decorative />}
              <span>{networkIdentity?.name ?? network}</span>
            </>
          )}
        </span>
      </span>
    </span>
  );
}

export function NetworkIdentity({
  network,
  size = 'sm',
  className,
}: {
  readonly network: string;
  readonly size?: IdentitySize;
  readonly className?: string;
}) {
  const identity = resolveNetworkIdentity(network);
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-text-secondary', className)}>
      <IdentityMark identity={identity} size={size} decorative />
      <span>{identity?.name ?? network}</span>
    </span>
  );
}
