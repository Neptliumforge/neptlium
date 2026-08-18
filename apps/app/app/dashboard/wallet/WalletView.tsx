'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, ShieldCheck } from 'lucide-react';
import { Button, Input, Label, Section, Stack } from '@neptlium/ui';
import type {
  CanonicalBalance,
  DepositInstruction,
  FundingActivity,
  FundingCapability,
  TransferActivity,
  TransferAlias,
} from '@/lib/api/financial';
import { createFundingIntentAction, createTransferAliasAction } from './actions';
import { FinancialValue, ProductStateBadge, ProductStateMessage } from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

type Tab = 'Balances' | 'Deposit' | 'Withdraw' | 'Destinations' | 'Activity';
const tabs: readonly Tab[] = ['Balances', 'Deposit', 'Withdraw', 'Destinations', 'Activity'];

function tabHash(tab: Tab) {
  return tab.toLowerCase();
}

function capabilityState(state: FundingCapability['state']) {
  if (state === 'ENABLED') return 'READY' as const;
  if (state === 'INELIGIBLE') return 'INELIGIBLE' as const;
  if (state === 'NOT_CONFIGURED') return 'NOT_CONFIGURED' as const;
  return 'UNAVAILABLE' as const;
}

function lifecycleState(state: string) {
  if (['AVAILABLE', 'RECONCILED', 'SETTLED'].includes(state)) return 'AVAILABLE' as const;
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(state)) return 'ERROR' as const;
  if (['CANCELLED', 'CANCELED'].includes(state)) return 'UNAVAILABLE' as const;
  if (state === 'RESERVED') return 'RESERVED' as const;
  if (['AUTHORIZED', 'PENDING_APPROVAL'].includes(state)) return 'REQUIRES_APPROVAL' as const;
  return 'PENDING' as const;
}

function normalizedNetwork(value: string | null | undefined) {
  return (value ?? '').replaceAll('-', '_').toUpperCase();
}

function usdToAtomic(value: string) {
  if (!/^\d+(?:\.\d{0,2})?$/.test(value)) return null;
  const [whole = '0', fraction = ''] = value.split('.');
  const atomic = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0') || '0');
  return atomic > 0n ? atomic.toString() : null;
}

export function WalletView({
  capabilities,
  capabilityError,
  balances,
  balanceError,
  fundingActivity,
  fundingActivityError,
  transferCapabilities,
  transferCapabilityError,
  transferActivity,
  transferActivityError,
  aliases,
  aliasError,
}: {
  readonly capabilities: readonly FundingCapability[];
  readonly capabilityError: boolean;
  readonly balances: readonly CanonicalBalance[];
  readonly balanceError: boolean;
  readonly fundingActivity: readonly FundingActivity[];
  readonly fundingActivityError: boolean;
  readonly transferCapabilities: readonly FundingCapability[];
  readonly transferCapabilityError: boolean;
  readonly transferActivity: readonly TransferActivity[];
  readonly transferActivityError: boolean;
  readonly aliases: readonly TransferAlias[];
  readonly aliasError: boolean;
}) {
  const [active, setActive] = useState<Tab>('Balances');
  const [selectedCapability, setSelectedCapability] = useState(capabilities[0]?.code ?? '');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingResult, setFundingResult] = useState<DepositInstruction | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [isFundingPending, startFunding] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const [selectedTransferCapability, setSelectedTransferCapability] = useState(transferCapabilities[0]?.code ?? '');
  const [selectedAliasId, setSelectedAliasId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const [aliasName, setAliasName] = useState('');
  const [destinationType, setDestinationType] = useState('crypto_address');
  const [destinationReference, setDestinationReference] = useState('');
  const [aliasResult, setAliasResult] = useState<string | null>(null);
  const [aliasSubmitError, setAliasSubmitError] = useState<string | null>(null);
  const [isAliasPending, startAlias] = useTransition();

  useEffect(() => {
    const synchronizeTab = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const matched = tabs.find((tab) => tabHash(tab) === hash);
      if (matched) setActive(matched);
    };
    synchronizeTab();
    window.addEventListener('hashchange', synchronizeTab);
    return () => window.removeEventListener('hashchange', synchronizeTab);
  }, []);

  const selected = capabilities.find((item) => item.code === selectedCapability);
  const selectedTransfer = transferCapabilities.find((item) => item.code === selectedTransferCapability);
  const outboundEnabled = transferCapabilities.some((item) => item.state === 'ENABLED');
  const verifiedAliases = aliases.filter((item) => item.verification_state === 'verified' && item.activation_state === 'active');
  const selectedTransferBalance = selectedTransfer
    ? balances.find((item) => item.asset === selectedTransfer.asset && (selectedTransfer.network === 'ACH' || normalizedNetwork(item.network) === normalizedNetwork(selectedTransfer.network)))
    : undefined;
  const selectedAlias = verifiedAliases.find((item) => item.id === selectedAliasId);
  const activity = useMemo(
    () => [
      ...fundingActivity.map((item) => ({ ...item, kind: 'Deposit' as const })),
      ...transferActivity.map((item) => ({ ...item, kind: 'Transfer' as const })),
    ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [fundingActivity, transferActivity],
  );

  const canonicalZeroPosition = !balanceError && balances.length === 0;
  const singleBalance = balances.length === 1 ? balances[0] : undefined;

  function selectTab(tab: Tab) {
    setActive(tab);
    window.history.replaceState(null, '', `#${tabHash(tab)}`);
  }

  function beginFunding() {
    if (!selected || selected.state !== 'ENABLED') return;
    const amountAtomic = selected.code === 'USD_ACH' ? usdToAtomic(fundingAmount) : undefined;
    if (selected.code === 'USD_ACH' && !amountAtomic) {
      setFundingError('Enter a positive USD amount with no more than two decimal places.');
      return;
    }
    setFundingError(null);
    setFundingResult(null);
    startFunding(async () => {
      const result = await createFundingIntentAction(selected.code, amountAtomic ?? undefined);
      if (!result.ok) {
        setFundingError(result.error);
        return;
      }
      setFundingResult(result.instructions);
    });
  }

  function saveDestination() {
    setAliasResult(null);
    setAliasSubmitError(null);
    startAlias(async () => {
      const result = await createTransferAliasAction(aliasName, destinationType, destinationReference);
      if (!result.ok) {
        setAliasSubmitError(result.error);
        return;
      }
      setAliasResult(result.message);
      setAliasName('');
      setDestinationReference('');
    });
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied((current) => current === label ? null : current), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Canonical capital operations"
        title="Capital Account"
        description="Fund capital, inspect canonical balances, prepare governed withdrawals, manage destinations, and follow lifecycle activity."
        meta="Source of truth · Neptlium canonical ledger"
        action={(
          <button type="button" onClick={() => selectTab('Deposit')} className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">
            Deposit capital
          </button>
        )}
      />

      <section className="grid gap-5 border-b border-border-hairline pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Canonical capital state</p>
          <div className="mt-2 text-[2rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.4rem]">
            {balanceError ? (
              'Unavailable'
            ) : canonicalZeroPosition ? (
              '0 positions'
            ) : singleBalance ? (
              <FinancialValue valueAtomic={singleBalance.total_atomic} asset={singleBalance.asset} />
            ) : (
              `${balances.length} canonical assets`
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {balanceError
              ? 'The API could not establish canonical balance state. No numeric value is inferred.'
              : canonicalZeroPosition
                ? 'No canonical balance positions are currently recorded. Funding capability is evaluated separately from ledger state.'
                : balances.length === 1
                  ? 'A single canonical denomination is established. Available, reserved, pending, and restricted state are shown below.'
                  : 'Balances remain separated by asset because Neptlium does not fabricate a cross-asset valuation.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => selectTab('Withdraw')} className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">Withdraw</button>
          <button type="button" onClick={() => selectTab('Activity')} className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2">View activity</button>
        </div>
      </section>

      <nav className="flex overflow-x-auto border-b border-border-hairline" role="tablist" aria-label="Capital Account sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => selectTab(tab)}
            className={`min-h-11 shrink-0 px-4 text-sm font-medium ${active === tab ? '-mb-px border-b-2 border-accent-primary text-text-primary' : 'border-b-2 border-transparent text-text-muted hover:text-text-secondary'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {active === 'Balances' && (
        <Section title="Balances">
          <div className="border-y border-border-hairline">
            {balanceError ? (
              <ProductStateMessage state="ERROR" title="Balances unavailable">Canonical ledger balances could not be loaded from api.neptlium.com.</ProductStateMessage>
            ) : balances.length === 0 ? (
              <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <ProductStateMessage state="NO_POSITION" title="No canonical capital positions">The canonical balance collection is successfully empty. No provider balance or capability is substituted.</ProductStateMessage>
                <button type="button" onClick={() => selectTab('Deposit')} className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover">Fund account</button>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(7rem,1fr)_repeat(5,minmax(7rem,auto))] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted lg:grid">
                  <span>Asset</span><span>Total</span><span>Available</span><span>Pending</span><span>Reserved</span><span>Restricted</span>
                </div>
                {balances.map((balance) => (
                  <div key={`${balance.asset}:${balance.network ?? ''}`} className="grid gap-4 border-b border-border-hairline py-5 last:border-0 lg:grid-cols-[minmax(7rem,1fr)_repeat(5,minmax(7rem,auto))] lg:items-center lg:gap-5">
                    <div><p className="text-sm font-medium text-text-primary">{balance.asset}</p><p className="mt-1 text-xs text-text-muted">{balance.network ?? 'Denomination'}</p></div>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:contents">
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Total</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.total_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Available</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.available_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Pending</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.pending_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Reserved</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.reserved_atomic} asset={balance.asset} /></dd></div>
                      <div><dt className="text-[11px] text-text-muted lg:hidden">Restricted</dt><dd className="mt-1 text-sm font-medium lg:mt-0"><FinancialValue valueAtomic={balance.restricted_atomic} asset={balance.asset} /></dd></div>
                    </dl>
                  </div>
                ))}
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-text-muted">Canonical balance records may legitimately contain zero. Missing records remain non-numeric and are never created from provider observations.</p>
        </Section>
      )}

      {active === 'Deposit' && (
        <Section title="Deposit capital">
          {capabilityError ? (
            <ProductStateMessage state="ERROR" title="Deposit capability unavailable">The API could not establish the current governed funding set.</ProductStateMessage>
          ) : capabilities.length === 0 ? (
            <ProductStateMessage state="NOT_CONFIGURED" title="No deposit assets exposed">No customer funding capability is exposed by the backend.</ProductStateMessage>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <p className="text-sm font-medium text-text-primary">1. Choose funding route</p>
                <div className="mt-4">
                  <Label htmlFor="deposit-asset">Asset and network</Label>
                  <select id="deposit-asset" value={selectedCapability} onChange={(event) => { setSelectedCapability(event.target.value); setFundingResult(null); setFundingError(null); }} className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary focus:border-border-focus focus:outline-none focus:shadow-[var(--shadow-focus-ring)]">
                    {capabilities.map((item) => <option key={item.code} value={item.code}>{item.asset} · {item.network}</option>)}
                  </select>
                </div>
                {selected ? (
                  <div className="mt-4 flex items-center justify-between gap-4 border-y border-border-hairline py-4">
                    <div><p className="text-sm font-medium">{selected.asset} funding</p><p className="mt-1 text-xs text-text-muted">Network · {selected.network}</p></div>
                    <ProductStateBadge state={capabilityState(selected.state)}>{selected.state.replaceAll('_', ' ').toLowerCase()}</ProductStateBadge>
                  </div>
                ) : null}
                {selected?.code === 'USD_ACH' && selected.state === 'ENABLED' ? (
                  <div className="mt-5">
                    <Label htmlFor="funding-amount">Funding amount (USD)</Label>
                    <Input id="funding-amount" inputMode="decimal" value={fundingAmount} onChange={(event) => setFundingAmount(event.target.value.replace(/[^0-9.]/g, ''))} placeholder="500.00" className="mt-2" />
                    <p className="mt-2 text-xs text-text-muted">The API receives the amount in canonical atomic units after review.</p>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">2. Governed instructions</p>
                {!selected || selected.state !== 'ENABLED' ? (
                  <div className="mt-4 border-y border-border-hairline">
                    <ProductStateMessage state={selected ? capabilityState(selected.state) : 'UNAVAILABLE'} title={selected ? `${selected.asset} deposits unavailable` : 'Deposit unavailable'}>
                      Instructions remain intentionally withheld until the API enables this rail and assigns a governed user-specific route.
                    </ProductStateMessage>
                  </div>
                ) : fundingResult ? (
                  <div className="mt-4 border-y border-border-hairline py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-sm font-medium">Deposit destination</p><p className="mt-1 text-xs text-text-muted">{selected.asset} · {selected.network}</p></div>
                      <ProductStateBadge state={fundingResult.state === 'ENABLED' ? 'READY' : 'PENDING'}>{fundingResult.state.replaceAll('_', ' ')}</ProductStateBadge>
                    </div>
                    {fundingResult.deposit_address ? (
                      <div className="mt-5">
                        <p className="text-xs text-text-muted">Address</p>
                        <div className="mt-2 flex items-start gap-2">
                          <p className="min-w-0 flex-1 break-all rounded-md bg-surface-2 px-3 py-2 font-mono text-xs leading-5 text-text-primary" aria-label={`Deposit address ${fundingResult.deposit_address}`}>{fundingResult.deposit_address}</p>
                          <button type="button" onClick={() => copyText('address', fundingResult.deposit_address!)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-surface-2" aria-label="Copy deposit address">
                            {copied === 'address' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {fundingResult.memo_or_tag ? (
                      <div className="mt-4">
                        <p className="text-xs text-text-muted">Memo / tag</p>
                        <div className="mt-2 flex items-center gap-2"><p className="min-w-0 flex-1 rounded-md bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary">{fundingResult.memo_or_tag}</p><button type="button" onClick={() => copyText('memo', fundingResult.memo_or_tag!)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-surface-2" aria-label="Copy memo or tag">{copied === 'memo' ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}</button></div>
                      </div>
                    ) : null}
                    {!fundingResult.deposit_address ? <p className="mt-4 text-sm leading-6 text-text-muted">A user-specific route is still being established. No treasury destination is exposed before the backend assigns it.</p> : null}
                    <div className="mt-5 border-t border-border-hairline pt-4">
                      <p className="text-xs leading-5 text-text-muted">Send only through the governed {selected.network} route shown here. Minimums, confirmations, fees, and settlement timing are not displayed unless the API establishes them.</p>
                      <p className="sr-only" aria-live="polite">{copied ? `${copied} copied` : ''}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border-y border-border-hairline py-5">
                    <p className="text-sm leading-6 text-text-muted">Continue to create a governed funding intent and request user-specific instructions. Creating an intent does not credit capital.</p>
                    {fundingError ? <p className="mt-3 text-sm text-status-danger" role="alert">{fundingError}</p> : null}
                    <Button className="mt-4" onClick={beginFunding} disabled={isFundingPending}>{isFundingPending ? 'Creating intent…' : 'Continue to instructions'}</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Section>
      )}

      {active === 'Withdraw' && (
        <Section title="Withdraw capital">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]">
            <div className="space-y-5">
              <div>
                <Label htmlFor="withdraw-asset">Asset and network</Label>
                <select id="withdraw-asset" value={selectedTransferCapability} onChange={(event) => setSelectedTransferCapability(event.target.value)} disabled={transferCapabilityError || transferCapabilities.length === 0} className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary disabled:opacity-60">
                  {transferCapabilities.length === 0 ? <option value="">No transfer rails exposed</option> : transferCapabilities.map((item) => <option key={item.code} value={item.code}>{item.asset} · {item.network}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between gap-4"><Label htmlFor="withdraw-destination">Destination</Label><button type="button" onClick={() => selectTab('Destinations')} className="text-xs font-medium text-accent-primary">Manage destinations</button></div>
                <select id="withdraw-destination" value={selectedAliasId} onChange={(event) => setSelectedAliasId(event.target.value)} disabled={verifiedAliases.length === 0} className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary disabled:opacity-60">
                  <option value="">Select verified destination</option>
                  {verifiedAliases.map((alias) => <option key={alias.id} value={alias.id}>{alias.alias}</option>)}
                </select>
                <p className="mt-2 text-xs text-text-muted">Only destinations that the API reports as verified and active can enter withdrawal review.</p>
              </div>
              <div>
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input id="withdraw-amount" inputMode="decimal" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="mt-2" />
              </div>
            </div>

            <div className="border-y border-border-hairline py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">Withdrawal review</p>
                  <p className="mt-1 text-xs text-text-muted">Preparation does not reserve or move capital.</p>
                </div>
                {selectedTransfer ? <ProductStateBadge state={capabilityState(selectedTransfer.state)}>{selectedTransfer.state.replaceAll('_', ' ').toLowerCase()}</ProductStateBadge> : null}
              </div>
              <dl className="mt-5 divide-y divide-border-hairline border-y border-border-hairline">
                <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-text-muted">Route</dt><dd className="text-sm font-medium text-text-primary">{selectedTransfer ? `${selectedTransfer.asset} · ${selectedTransfer.network}` : 'Not established'}</dd></div>
                <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-text-muted">Canonical available</dt><dd className="text-sm font-medium">{selectedTransfer && selectedTransferBalance ? <FinancialValue valueAtomic={selectedTransferBalance.available_atomic} asset={selectedTransfer.asset} /> : <span className="text-text-muted">Not established</span>}</dd></div>
                <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-text-muted">Destination</dt><dd className="text-sm font-medium text-text-primary">{selectedAlias?.alias ?? 'Not selected'}</dd></div>
                <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-text-muted">Amount</dt><dd className="text-sm font-medium text-text-primary">{transferAmount ? `${transferAmount} ${selectedTransfer?.asset ?? ''}`.trim() : 'Not entered'}</dd></div>
                <div className="flex items-center justify-between gap-4 py-3"><dt className="text-xs text-text-muted">Fee</dt><dd className="text-sm font-medium text-text-muted">Not established</dd></div>
              </dl>

              <div className="mt-5">
                {transferCapabilityError ? (
                  <ProductStateMessage state="ERROR" title="Withdrawal capability unavailable" compact />
                ) : !selectedTransfer || selectedTransfer.state !== 'ENABLED' ? (
                  <ProductStateMessage state={selectedTransfer ? capabilityState(selectedTransfer.state) : 'UNAVAILABLE'} title="Withdrawal unavailable" compact>No enabled outbound rail is established for this selection.</ProductStateMessage>
                ) : verifiedAliases.length === 0 ? (
                  <ProductStateMessage state="REQUIRES_APPROVAL" title="Verified destination required" compact>Save a destination and complete governed verification before movement can be reviewed.</ProductStateMessage>
                ) : (
                  <ProductStateMessage state="REQUIRES_APPROVAL" title="Submission capability not exposed" compact>The frontend review is complete, but apps/app does not have an API mutation that safely reserves canonical capital and enters manual approval. No request will be submitted.</ProductStateMessage>
                )}
              </div>
              <Button className="mt-4" disabled>Submit withdrawal</Button>
            </div>
          </div>

          <ol className="mt-8 grid border-y border-border-hairline sm:grid-cols-4 xl:grid-cols-7" aria-label="Withdrawal lifecycle">
            {['Requested', 'Reserved', 'Pending approval', 'Approved', 'Submitted', 'Settled', 'Reconciled'].map((stage, index) => <li key={stage} className="border-b border-border-hairline py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:px-3 sm:last:border-r-0"><span className="text-[11px] tabular-nums text-accent-primary">0{index + 1}</span><p className="mt-1 text-xs font-medium text-text-primary">{stage}</p></li>)}
          </ol>
        </Section>
      )}

      {active === 'Destinations' && (
        <Section title="Withdrawal destinations">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
            <div>
              <p className="text-sm font-medium text-text-primary">Add destination</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">Save a customer destination reference for governed verification. Client validation improves entry quality; API verification and activation remain authoritative.</p>
              <div className="mt-5 space-y-4">
                <div><Label htmlFor="destination-label">Label</Label><Input id="destination-label" value={aliasName} onChange={(event) => setAliasName(event.target.value)} placeholder="Primary treasury wallet" className="mt-2" /></div>
                <div><Label htmlFor="destination-type">Destination type</Label><select id="destination-type" value={destinationType} onChange={(event) => setDestinationType(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary"><option value="crypto_address">Crypto address</option><option value="bank_destination">Bank destination</option></select></div>
                <div><Label htmlFor="destination-reference">Destination reference</Label><Input id="destination-reference" value={destinationReference} onChange={(event) => setDestinationReference(event.target.value.trimStart())} placeholder="Address or governed destination reference" className="mt-2 font-mono text-sm" /></div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p>Saving a destination does not prove ownership, network compatibility, verification, or activation. Those remain server-governed states.</p></div>
              {aliasSubmitError ? <p className="mt-3 text-sm text-status-danger" role="alert">{aliasSubmitError}</p> : null}
              {aliasResult ? <p className="mt-3 text-sm text-text-secondary" role="status">{aliasResult}</p> : null}
              <Button className="mt-4" onClick={saveDestination} disabled={isAliasPending}>{isAliasPending ? 'Saving destination…' : 'Save for verification'}</Button>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-text-primary">Saved destinations</p><p className="mt-1 text-xs text-text-muted">Verification and activation are independent states.</p></div><span className="text-xs tabular-nums text-text-muted">{aliases.length}</span></div>
              <div className="mt-4 border-y border-border-hairline">
                {aliasError ? (
                  <ProductStateMessage state="ERROR" title="Destinations unavailable">The governed destination collection could not be loaded.</ProductStateMessage>
                ) : aliases.length === 0 ? (
                  <ProductStateMessage state="NO_ACTIVITY" title="No destinations saved">Add a destination reference to begin the governed verification path.</ProductStateMessage>
                ) : aliases.map((alias) => (
                  <div key={alias.id} className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{alias.alias}</p><p className="mt-1 text-xs text-text-muted">{alias.destination_type.replaceAll('_', ' ')} · added {new Date(alias.created_at).toLocaleDateString()}</p></div>
                    <div className="flex flex-wrap items-center gap-2"><ProductStateBadge state={alias.verification_state === 'verified' ? 'READY' : 'REQUIRES_APPROVAL'}>{alias.verification_state.replaceAll('_', ' ')}</ProductStateBadge><span className="text-xs text-text-muted">{alias.activation_state.replaceAll('_', ' ')}</span></div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-text-muted">Destination removal is not exposed by the current API contract, so this frontend does not display a non-functional delete control.</p>
            </div>
          </div>
        </Section>
      )}

      {active === 'Activity' && (
        <Section title="Capital activity">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-text-muted">Funding and governed transfer events are shown from API-backed activity collections.</p><Link href="/dashboard/transactions" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary">Full activity <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
          <div className="border-y border-border-hairline">
            {fundingActivityError && transferActivityError ? (
              <ProductStateMessage state="ERROR" title="Activity unavailable">The canonical funding and transfer activity feeds could not be loaded.</ProductStateMessage>
            ) : activity.length === 0 ? (
              <ProductStateMessage state="NO_ACTIVITY" title="No capital activity yet">Funding and governed movement will appear here when canonical intents exist.</ProductStateMessage>
            ) : (
              activity.map((item) => <div key={`${item.kind}:${item.id}`} className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"><div className="min-w-0"><p className="text-sm font-medium">{item.kind} · {item.asset}</p><p className="mt-1 truncate text-xs text-text-muted">{item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}</p></div><div className="text-sm font-medium">{item.amount_atomic ? <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} /> : <span className="text-text-muted">Amount unavailable</span>}</div><ProductStateBadge state={lifecycleState(item.state)}>{item.state.replaceAll('_', ' ')}</ProductStateBadge></div>)
            )}
          </div>
        </Section>
      )}
    </Stack>
  );
}
