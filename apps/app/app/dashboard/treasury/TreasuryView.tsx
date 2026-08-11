import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import type { CanonicalBalance, FundingCapability, TransferActivity, TransferAlias } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';

function capabilityState(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'READY' as const;
  if (state === 'INELIGIBLE') return 'INELIGIBLE' as const;
  if (state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED' as const;
  return 'UNAVAILABLE' as const;
}

function transferState(state: string) {
  if (['RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(state)) return 'ERROR' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

export function TreasuryView({
  balances,
  balanceError,
  fundingCapabilities,
  fundingError,
  aliases,
  aliasError,
  transfers,
  transferError,
  transferCapabilities,
}: {
  readonly balances: readonly CanonicalBalance[];
  readonly balanceError: boolean;
  readonly fundingCapabilities: readonly FundingCapability[];
  readonly fundingError: boolean;
  readonly aliases: readonly TransferAlias[];
  readonly aliasError: boolean;
  readonly transfers: readonly TransferActivity[];
  readonly transferError: boolean;
  readonly transferCapabilities: readonly FundingCapability[];
}) {
  const activeAliases = aliases.filter((item) => item.activation_state === 'active');
  const enabledFunding = fundingCapabilities.filter((item) => item.state === 'ENABLED');
  const enabledTransfers = transferCapabilities.filter((item) => item.state === 'ENABLED');

  return (
    <Stack>
      <header>
        <h1>Treasury</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Canonical liquidity, governed funding rails, verified destinations, and transfer lifecycle state.
        </p>
      </header>

      <Section title="Liquidity">
        <div className="border-y border-border-hairline">
          {balanceError ? (
            <ProductStateMessage state="ERROR" title="Liquidity unavailable">Canonical balance state could not be loaded from the Neptlium API.</ProductStateMessage>
          ) : balances.length === 0 ? (
            <ProductStateMessage state="UNAVAILABLE" title="No canonical liquidity yet">Treasury liquidity appears only from reconciled customer ledger state. Provider aggregate balances are not substituted.</ProductStateMessage>
          ) : (
            balances.map((balance) => (
              <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[minmax(8rem,1fr)_repeat(3,minmax(7rem,auto))] sm:items-center sm:gap-5">
                <div><p className="text-sm font-medium">{balance.asset}</p><p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'}</p></div>
                <dl className="grid grid-cols-3 gap-4 sm:contents">
                  <div><dt className="text-[11px] text-text-muted sm:hidden">Available</dt><dd className="mt-1 text-sm font-medium sm:mt-0"><FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /></dd></div>
                  <div><dt className="text-[11px] text-text-muted sm:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium sm:mt-0"><FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /></dd></div>
                  <div><dt className="text-[11px] text-text-muted sm:hidden">Pending</dt><dd className="mt-1 text-sm font-medium sm:mt-0"><FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /></dd></div>
                </dl>
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="Funding">
        <div className="border-y border-border-hairline">
          {fundingError ? (
            <ProductStateMessage state="ERROR" title="Funding capability unavailable">Current funding capability could not be loaded.</ProductStateMessage>
          ) : fundingCapabilities.length === 0 ? (
            <ProductStateMessage state="NOT_CONFIGURED" title="No funding rails exposed" />
          ) : (
            fundingCapabilities.map((item) => (
              <div key={item.code} className="flex items-center justify-between gap-4 border-b border-border-hairline py-4 last:border-0">
                <div><p className="text-sm font-medium">{item.asset} · {item.network}</p><p className="mt-1 text-xs text-text-muted">Governed customer funding rail</p></div>
                <ProductStateBadge state={capabilityState(item.state)} />
              </div>
            ))
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-text-muted">{enabledFunding.length ? `${enabledFunding.length} enabled funding rail${enabledFunding.length === 1 ? '' : 's'}` : 'No live funding rail is enabled.'}</p>
          <Link href="/dashboard/wallet" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">Open Capital Account <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </Section>

      <Section title="Transfers">
        <div className="border-y border-border-hairline">
          {transferError ? (
            <ProductStateMessage state="ERROR" title="Transfer activity unavailable" />
          ) : transfers.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No governed transfers yet">Requested, reserved, approved, submitted, settled, and reconciled transfer states will appear here when canonical transfer intents exist.</ProductStateMessage>
          ) : (
            transfers.slice(0, 6).map((item) => (
              <div key={item.id} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5">
                <div className="min-w-0"><p className="text-sm font-medium">{item.asset} · {item.network ?? item.rail}</p><p className="mt-1 truncate text-xs text-text-muted">{new Date(item.created_at).toLocaleString()}</p></div>
                <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} className="text-sm font-medium" />
                <ProductStateBadge state={transferState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-xs text-text-muted">{enabledTransfers.length ? `${enabledTransfers.length} transfer rail${enabledTransfers.length === 1 ? '' : 's'} enabled` : 'Outbound execution remains closed.'}</p>
      </Section>

      <Section title="Destinations">
        <div className="border-y border-border-hairline">
          {aliasError ? (
            <ProductStateMessage state="ERROR" title="Destination aliases unavailable" />
          ) : aliases.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No destination aliases yet">Verified destination references will appear here without exposing provider credentials or sensitive custody metadata.</ProductStateMessage>
          ) : (
            aliases.map((alias) => (
              <div key={alias.id} className="flex items-center justify-between gap-4 border-b border-border-hairline py-4 last:border-0">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{alias.alias}</p><p className="mt-1 text-xs text-text-muted">{alias.destination_type.replaceAll('_', ' ')}</p></div>
                <div className="flex items-center gap-2">
                  <ProductStateBadge state={alias.verification_state === 'verified' ? 'READY' : 'REQUIRES_APPROVAL'}>{alias.verification_state}</ProductStateBadge>
                  <span className="text-xs text-text-muted">{alias.activation_state}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {activeAliases.length ? <p className="mt-3 text-xs text-text-muted">{activeAliases.length} active destination alias{activeAliases.length === 1 ? '' : 'es'}.</p> : null}
      </Section>
    </Stack>
  );
}
