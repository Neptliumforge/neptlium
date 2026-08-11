'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button, Input, Label, Section, Stack } from '@neptlium/ui';
import type {
  CanonicalBalance,
  DepositInstruction,
  FundingActivity,
  FundingCapability,
  TransferActivity,
  TransferAlias,
} from '@/lib/api/financial';
import { createFundingIntentAction } from './actions';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';

type Tab = 'Balances' | 'Deposit' | 'Withdraw' | 'Activity';
const tabs: readonly Tab[] = ['Balances', 'Deposit', 'Withdraw', 'Activity'];

function capabilityState(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'READY' as const;
  if (state === 'INELIGIBLE') return 'INELIGIBLE' as const;
  if (state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED' as const;
  return 'UNAVAILABLE' as const;
}

function lifecycleState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED'].includes(state)) return 'ERROR' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

export function WalletView({
  capabilities,
  capabilityError,
  balances,
  balanceError,
  fundingActivity,
  fundingActivityError,
  transferCapabilities,
  transferActivity,
  aliases,
}: {
  readonly capabilities: readonly FundingCapability[];
  readonly capabilityError: boolean;
  readonly balances: readonly CanonicalBalance[];
  readonly balanceError: boolean;
  readonly fundingActivity: readonly FundingActivity[];
  readonly fundingActivityError: boolean;
  readonly transferCapabilities: readonly FundingCapability[];
  readonly transferActivity: readonly TransferActivity[];
  readonly aliases: readonly TransferAlias[];
}) {
  const [active, setActive] = useState<Tab>('Balances');
  const [selectedCapability, setSelectedCapability] = useState(capabilities[0]?.code ?? '');
  const [amountAtomic, setAmountAtomic] = useState('');
  const [fundingResult, setFundingResult] = useState<DepositInstruction | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [isFundingPending, startFunding] = useTransition();

  const selected = capabilities.find((item) => item.code === selectedCapability);
  const outboundEnabled = transferCapabilities.some((item) => item.state === 'ENABLED');
  const verifiedAliases = aliases.filter((item) => item.verification_state === 'verified' && item.activation_state === 'active');
  const activity = useMemo(
    () => [
      ...fundingActivity.map((item) => ({ ...item, kind: 'Deposit' as const })),
      ...transferActivity.map((item) => ({ ...item, kind: 'Transfer' as const })),
    ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [fundingActivity, transferActivity],
  );

  function beginFunding() {
    if (!selected || selected.state !== 'ENABLED') return;
    setFundingError(null);
    setFundingResult(null);
    startFunding(async () => {
      const result = await createFundingIntentAction(selected.code, amountAtomic || undefined);
      if (!result.ok) {
        setFundingError(result.error);
        return;
      }
      setFundingResult(result.instructions);
    });
  }

  return (
    <Stack>
      <header>
        <h1>Capital Account</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
          Canonical balances, governed funding, manual-approval withdrawals, and account activity.
        </p>
      </header>

      <div className="flex overflow-x-auto border-b border-border-hairline" role="tablist" aria-label="Capital Account sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`min-h-11 shrink-0 px-4 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === 'Balances' && (
        <Section title="Canonical balances">
          <div className="border-y border-border-hairline">
            {balanceError ? (
              <ProductStateMessage state="ERROR" title="Balances unavailable">Canonical ledger balances could not be loaded from api.neptlium.com.</ProductStateMessage>
            ) : balances.length === 0 ? (
              <ProductStateMessage state="UNAVAILABLE" title="No canonical capital yet">Capital appears only after verified evidence, balanced ledger posting, and reconciliation.</ProductStateMessage>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(7rem,1fr)_repeat(4,minmax(7rem,auto))] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted md:grid">
                  <span>Asset</span><span>Available</span><span>Pending</span><span>Reserved</span><span>Restricted</span>
                </div>
                {balances.map((balance) => (
                  <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 md:grid-cols-[minmax(7rem,1fr)_repeat(4,minmax(7rem,auto))] md:items-center md:gap-5">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{balance.asset}</p>
                      <p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:contents">
                      <div><dt className="text-[11px] text-text-muted md:hidden">Available</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted md:hidden">Pending</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted md:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted md:hidden">Restricted</dt><dd className="mt-1 text-sm font-medium md:mt-0"><FinancialValue valueAtomic={balance.restricted_atomic} asset={balance.asset} /></dd></div>
                    </dl>
                  </div>
                ))}
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-text-muted">Source: Neptlium canonical ledger. Provider aggregate balances are not shown as customer capital.</p>
        </Section>
      )}

      {active === 'Deposit' && (
        <Section title="Deposit capital">
          {capabilityError ? (
            <ProductStateMessage state="ERROR" title="Deposit capability unavailable">The API could not establish the current governed funding set.</ProductStateMessage>
          ) : capabilities.length === 0 ? (
            <ProductStateMessage state="NOT_CONFIGURED" title="No deposit assets exposed">No customer funding capability is exposed by the backend.</ProductStateMessage>
          ) : (
            <div className="grid gap-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div>
                <Label htmlFor="deposit-asset">Choose asset</Label>
                <select
                  id="deposit-asset"
                  value={selectedCapability}
                  onChange={(event) => {
                    setSelectedCapability(event.target.value);
                    setFundingResult(null);
                    setFundingError(null);
                  }}
                  className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary focus:border-border-focus focus:outline-none focus:shadow-[var(--shadow-focus-ring)]"
                >
                  {capabilities.map((item) => <option key={item.code} value={item.code}>{item.asset} · {item.network}</option>)}
                </select>
                {selected ? (
                  <div className="mt-4 border-y border-border-hairline py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div><p className="text-sm font-medium">{selected.asset} deposits</p><p className="mt-1 text-xs text-text-muted">{selected.network}</p></div>
                      <ProductStateBadge state={capabilityState(selected.state)} />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                {!selected || selected.state !== 'ENABLED' ? (
                  <ProductStateMessage state={selected ? capabilityState(selected.state) : 'UNAVAILABLE'} title={selected ? `${selected.asset} deposits` : 'Deposit unavailable'}>
                    Deposit infrastructure for this asset is not currently available. Neptlium will not display an address, memo, tag, or bank instruction until the API enables the rail and assigns a governed user-specific route.
                  </ProductStateMessage>
                ) : fundingResult ? (
                  <div className="border-y border-border-hairline py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium">Deposit instructions</p>
                      <ProductStateBadge state={fundingResult.state === 'ENABLED' ? 'READY' : 'PENDING'}>{fundingResult.state.replaceAll('_', ' ')}</ProductStateBadge>
                    </div>
                    {fundingResult.deposit_address ? (
                      <div className="mt-5">
                        <p className="text-xs text-text-muted">Address</p>
                        <p className="mt-1 break-all font-mono text-xs leading-5 text-text-primary" aria-label={`Deposit address ${fundingResult.deposit_address}`}>{fundingResult.deposit_address}</p>
                      </div>
                    ) : null}
                    {fundingResult.memo_or_tag ? (
                      <div className="mt-4"><p className="text-xs text-text-muted">Memo / tag</p><p className="mt-1 font-mono text-sm text-text-primary">{fundingResult.memo_or_tag}</p></div>
                    ) : null}
                    {!fundingResult.deposit_address ? <p className="mt-4 text-sm text-text-muted">A user-specific route is being established. No treasury destination is exposed before the backend assigns it.</p> : null}
                  </div>
                ) : (
                  <div className="border-y border-border-hairline py-5">
                    {selected.code === 'USD_ACH' ? (
                      <div className="mb-4">
                        <Label htmlFor="funding-amount">Amount in cents</Label>
                        <Input id="funding-amount" inputMode="numeric" value={amountAtomic} onChange={(event) => setAmountAtomic(event.target.value.replace(/\D/g, ''))} placeholder="50000" className="mt-2" />
                      </div>
                    ) : null}
                    <p className="text-sm text-text-muted">Creating a funding intent does not credit capital. Availability still requires provider evidence, canonical posting, and reconciliation.</p>
                    {fundingError ? <p className="mt-3 text-sm text-status-danger" role="alert">{fundingError}</p> : null}
                    <Button className="mt-4" onClick={beginFunding} disabled={isFundingPending || (selected.code === 'USD_ACH' && !amountAtomic)}>
                      {isFundingPending ? 'Creating intent…' : 'Continue to deposit instructions'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Section>
      )}

      {active === 'Withdraw' && (
        <Section title="Request withdrawal">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
            <div className="border-y border-border-hairline py-5">
              <p className="text-sm font-medium text-text-primary">Manual approval governs outbound movement</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">
                A withdrawal request must reserve canonical available capital before operator approval. Approval authorizes execution only; provider submission, settlement, and reconciliation remain later states.
              </p>
              {!outboundEnabled ? (
                <ProductStateMessage state="UNAVAILABLE" title="Withdrawal requests are not active" compact>
                  No production outbound rail is enabled. The product will not accept a request that cannot enter the governed reservation and approval lifecycle.
                </ProductStateMessage>
              ) : verifiedAliases.length === 0 ? (
                <ProductStateMessage state="REQUIRES_APPROVAL" title="Verified destination required" compact>
                  Add or verify a governed Treasury destination before requesting movement.
                </ProductStateMessage>
              ) : null}
            </div>
            <ol className="border-y border-border-hairline py-4" aria-label="Withdrawal lifecycle">
              {['Requested', 'Reserved', 'Pending approval', 'Approved', 'Submitted', 'Settled', 'Reconciled'].map((stage, index) => (
                <li key={stage} className="flex items-center gap-3 border-b border-border-hairline py-2.5 last:border-0">
                  <span className="w-6 text-[11px] tabular-nums text-accent-primary">0{index + 1}</span>
                  <span className="text-sm text-text-primary">{stage}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      )}

      {active === 'Activity' && (
        <Section title="Capital activity">
          <div className="border-y border-border-hairline">
            {fundingActivityError ? (
              <ProductStateMessage state="ERROR" title="Activity unavailable">The canonical funding activity feed could not be loaded.</ProductStateMessage>
            ) : activity.length === 0 ? (
              <ProductStateMessage state="NO_ACTIVITY" title="No capital activity yet">Funding and governed movement will appear here when canonical intents exist.</ProductStateMessage>
            ) : (
              activity.map((item) => (
                <div key={`${item.kind}:${item.id}`} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5">
                  <div className="min-w-0"><p className="text-sm font-medium">{item.kind} · {item.asset}</p><p className="mt-1 truncate text-xs text-text-muted">{item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}</p></div>
                  <div className="text-sm font-medium">{item.amount_atomic ? <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} /> : <span className="text-text-muted">Amount unavailable</span>}</div>
                  <ProductStateBadge state={lifecycleState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge>
                </div>
              ))
            )}
          </div>
        </Section>
      )}
    </Stack>
  );
}
