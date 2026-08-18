import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, Stack } from '@neptlium/ui';
import type { CanonicalBalance, FundingCapability, TransferActivity, TransferAlias } from '@/lib/api/financial';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

function capabilityState(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'READY' as const;
  if (state === 'INELIGIBLE') return 'INELIGIBLE' as const;
  if (state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED' as const;
  return 'UNAVAILABLE' as const;
}

function transferState(state: string) {
  if (['RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(state)) return 'ERROR' as const;
  if (['CANCELLED', 'CANCELED'].includes(state)) return 'UNAVAILABLE' as const;
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
  const verifiedAliases = aliases.filter((item) => item.activation_state === 'active' && item.verification_state === 'verified');
  const enabledFunding = fundingCapabilities.filter((item) => item.state === 'ENABLED');
  const enabledTransfers = transferCapabilities.filter((item) => item.state === 'ENABLED');
  const singleBalance = balances.length === 1 ? balances[0] : undefined;

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Liquidity and movement control"
        title="Treasury"
        description="Monitor canonical liquidity, funding readiness, governed destinations, and transfer lifecycle without promoting provider state into customer capital."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/wallet#withdraw" className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Prepare withdrawal</Link>
            <Link href="/dashboard/wallet#destinations" className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">Destinations</Link>
          </div>
        )}
      />

      <section className="grid gap-6 border-b border-border-hairline pb-6 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(8rem,0.6fr))] lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Treasury position</p>
          <div className="mt-2 text-[2rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.4rem]">
            {balanceError ? 'Unavailable' : balances.length === 0 ? '0 positions' : singleBalance ? <FinancialValue valueAtomic={singleBalance.available_atomic} asset={singleBalance.asset} /> : `${balances.length} canonical assets`}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
            {balanceError ? 'Canonical liquidity could not be established.' : balances.length === 0 ? 'The canonical position collection is successfully empty.' : singleBalance ? 'Canonical available capital for the established denomination.' : 'Liquidity remains separated by asset; no cross-asset total is inferred.'}
          </p>
        </div>
        <div><p className="text-xs text-text-muted">Funding rails</p><p className="mt-1 text-sm font-medium text-text-primary">{fundingError ? 'Unavailable' : `${enabledFunding.length} enabled`}</p></div>
        <div><p className="text-xs text-text-muted">Verified destinations</p><p className="mt-1 text-sm font-medium text-text-primary">{aliasError ? 'Unavailable' : verifiedAliases.length}</p></div>
        <div><p className="text-xs text-text-muted">Execution</p><p className="mt-1 text-sm font-medium text-text-primary">{enabledTransfers.length ? 'Capability exposed' : 'Closed'}</p></div>
      </section>

      <Section title="Liquidity">
        <div className="border-y border-border-hairline">
          {balanceError ? (
            <ProductStateMessage state="ERROR" title="Liquidity unavailable">Canonical balance state could not be loaded from the Neptlium API.</ProductStateMessage>
          ) : balances.length === 0 ? (
            <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <ProductStateMessage state="NO_POSITION" title="No canonical liquidity positions">Provider aggregate balances are not substituted for the empty canonical collection.</ProductStateMessage>
              <Link href="/dashboard/wallet#deposit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Fund capital</Link>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(8rem,1fr)_repeat(4,minmax(7rem,auto))] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted lg:grid">
                <span>Asset</span><span>Total</span><span>Available</span><span>Reserved</span><span>Pending</span>
              </div>
              {balances.map((balance) => (
                <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-4 border-b border-border-hairline py-5 last:border-0 lg:grid-cols-[minmax(8rem,1fr)_repeat(4,minmax(7rem,auto))] lg:items-center lg:gap-5">
                  <div><p className="text-sm font-medium">{balance.asset}</p><p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'}</p></div>
                  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:contents">
                    <div><dt className="text-[11px] text-text-muted lg:hidden">Total</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} /></dd></div>
                    <div><dt className="text-[11px] text-text-muted lg:hidden">Available</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /></dd></div>
                    <div><dt className="text-[11px] text-text-muted lg:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /></dd></div>
                    <div><dt className="text-[11px] text-text-muted lg:hidden">Pending</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /></dd></div>
                  </dl>
                </div>
              ))}
            </>
          )}
        </div>
      </Section>

      <Section title="Funding readiness">
        <div className="border-y border-border-hairline">
          {fundingError ? (
            <ProductStateMessage state="ERROR" title="Funding capability unavailable">Current funding capability could not be loaded.</ProductStateMessage>
          ) : fundingCapabilities.length === 0 ? (
            <ProductStateMessage state="NOT_CONFIGURED" title="No funding rails exposed" />
          ) : (
            fundingCapabilities.map((item) => (
              <div key={item.code} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <div><p className="text-sm font-medium">{item.asset} · {item.network}</p><p className="mt-1 text-xs text-text-muted">Governed customer funding rail · independent of canonical balance state</p></div>
                <ProductStateBadge state={capabilityState(item.state)}>{item.state.replaceAll('_', ' ').toLowerCase()}</ProductStateBadge>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 text-xs text-text-muted">{enabledFunding.length ? `${enabledFunding.length} enabled funding rail${enabledFunding.length === 1 ? '' : 's'}.` : 'No enabled funding rail is currently exposed.'}</p>
      </Section>

      <Section title="Movement control">
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Recent transfers</p><p className="mt-1 text-xs text-text-muted">Canonical lifecycle events</p></div><Link href="/dashboard/wallet#activity" className="text-sm font-medium text-accent-primary">All activity</Link></div>
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
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Destinations</p><p className="mt-1 text-xs text-text-muted">Verification and activation remain server-owned</p></div><Link href="/dashboard/wallet#destinations" className="text-sm font-medium text-accent-primary">Manage</Link></div>
            <div className="border-y border-border-hairline">
              {aliasError ? (
                <ProductStateMessage state="ERROR" title="Destinations unavailable" />
              ) : aliases.length === 0 ? (
                <ProductStateMessage state="NO_ACTIVITY" title="No destinations saved">Add a withdrawal destination in Capital Account to begin governed verification.</ProductStateMessage>
              ) : (
                aliases.map((alias) => (
                  <div key={alias.id} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{alias.alias}</p><p className="mt-1 text-xs text-text-muted">{alias.destination_type.replaceAll('_', ' ')}</p></div>
                    <div className="flex flex-wrap items-center gap-2"><ProductStateBadge state={alias.verification_state === 'verified' ? 'READY' : 'REQUIRES_APPROVAL'}>{alias.verification_state.replaceAll('_', ' ')}</ProductStateBadge><span className="text-xs text-text-muted">{alias.activation_state.replaceAll('_', ' ')}</span></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-y border-border-hairline py-5 sm:grid-cols-3">
          <div><p className="text-xs text-text-muted">Active destination records</p><p className="mt-1 text-sm font-medium text-text-primary">{aliasError ? 'Unavailable' : activeAliases.length}</p></div>
          <div><p className="text-xs text-text-muted">Verified and active</p><p className="mt-1 text-sm font-medium text-text-primary">{aliasError ? 'Unavailable' : verifiedAliases.length}</p></div>
          <div><p className="text-xs text-text-muted">Outbound execution</p><p className="mt-1 text-sm font-medium text-text-primary">{enabledTransfers.length ? 'Capability exposed' : 'Closed'}</p></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-text-muted">An enabled capability does not prove reservation, submission, settlement, or reconciliation. Capital Account stops withdrawal preparation before any unsupported mutation.</p>
      </Section>

      <Section title="Treasury controls">
        <div className="divide-y divide-border-hairline border-y border-border-hairline">
          {[
            ['Liquidity provenance', 'Only canonical ledger balances are treated as customer liquidity.'],
            ['Destination governance', 'Saving a destination does not prove verification or activation.'],
            ['Movement authority', 'Reservation must precede submission; approval does not prove execution.'],
            ['Reconciliation', 'Settlement and reconciliation remain distinct states and are never collapsed into completed.'],
          ].map(([title, detail]) => <div key={title} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6"><p className="text-sm font-medium text-text-primary">{title}</p><p className="text-sm leading-6 text-text-muted">{detail}</p></div>)}
        </div>
        <Link href="/dashboard/wallet#withdraw" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">Prepare governed movement <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </Section>
    </Stack>
  );
}
