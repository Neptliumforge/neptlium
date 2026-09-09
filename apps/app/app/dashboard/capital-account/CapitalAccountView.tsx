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
import {
  FinancialValue,
  ProductStateBadge,
  ProductStateMessage,
} from '@/components/product/ProductState';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

type Tab = 'Capital State' | 'Funding' | 'Movement' | 'Destinations' | 'Capital Context';
const tabs: readonly Tab[] = [
  'Capital State',
  'Funding',
  'Movement',
  'Destinations',
  'Capital Context',
];

const tabHashes: Record<Tab, string> = {
  'Capital State': 'capital-state',
  Funding: 'funding',
  Movement: 'movement',
  Destinations: 'destinations',
  'Capital Context': 'capital-context',
};

function tabHash(tab: Tab) {
  return tabHashes[tab];
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

const fundingStages = [
  { label: 'Funding intent', states: ['CREATED', 'AUTHORIZED'] },
  { label: 'Deposit route', states: ['PROVIDER_SUBMITTED'] },
  { label: 'Provider observation', states: ['PENDING', 'PROVIDER_CONFIRMED'] },
  { label: 'Reconciliation', states: ['LEDGER_POSTED', 'RECONCILED'] },
  { label: 'Capital state update', states: ['AVAILABLE'] },
] as const;

const movementStages = [
  { label: 'Request', states: ['REQUESTED'] },
  { label: 'Destination verification', states: [] },
  { label: 'Reservation', states: ['RESERVED'] },
  { label: 'Approval', states: ['PENDING_APPROVAL', 'APPROVED'] },
  { label: 'Provider submission', states: ['SUBMITTED'] },
  { label: 'Settlement', states: ['SETTLED'] },
  { label: 'Completion', states: ['RECONCILED'] },
] as const;

function fundingNextAction(state: string | undefined) {
  if (!state) return 'Create a funding instruction';
  if (['FAILED', 'RETURNED', 'REVERSED', 'CANCELLED'].includes(state))
    return 'Review the recorded outcome';
  if (state === 'AVAILABLE') return 'No further action required';
  if (['CREATED', 'AUTHORIZED'].includes(state)) return 'Await deposit route availability';
  if (['PROVIDER_SUBMITTED', 'PENDING'].includes(state)) return 'Await provider confirmation';
  if (state === 'PROVIDER_CONFIRMED') return 'Await canonical ledger posting';
  if (state === 'LEDGER_POSTED') return 'Await reconciliation';
  if (state === 'RECONCILED') return 'Await capital state update';
  return 'Await authoritative lifecycle update';
}

function movementNextAction(state: string | undefined) {
  if (!state) return 'Movement requests are not activated';
  if (['FAILED', 'REVERSED', 'CANCELLED'].includes(state)) return 'Review the recorded outcome';
  if (state === 'RECONCILED') return 'No further action required';
  if (state === 'REQUESTED') return 'Await capital reservation';
  if (state === 'RESERVED') return 'Await approval review';
  if (state === 'PENDING_APPROVAL') return 'Administrator approval required';
  if (state === 'APPROVED') return 'Await provider submission';
  if (state === 'SUBMITTED') return 'Await provider settlement';
  if (state === 'SETTLED') return 'Await reconciliation';
  return 'Await authoritative lifecycle update';
}

function LifecycleTimeline({
  label,
  stages,
  currentState,
}: {
  readonly label: string;
  readonly stages: readonly { readonly label: string; readonly states: readonly string[] }[];
  readonly currentState?: string;
}) {
  const currentIndex = stages.findIndex((stage) =>
    (stage.states as readonly string[]).includes(currentState ?? ''),
  );
  return (
    <ol
      className="grid border-y border-border-hairline sm:grid-cols-3 xl:grid-cols-7"
      aria-label={label}
    >
      {stages.map((stage, index) => {
        const reached = currentIndex >= index;
        const current = currentIndex === index;
        return (
          <li
            key={stage.label}
            className="border-b border-border-hairline py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:px-3 sm:last:border-r-0"
            aria-current={current ? 'step' : undefined}
          >
            <span
              className={`text-[11px] tabular-nums ${reached ? 'text-accent-primary' : 'text-text-muted'}`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="mt-1 text-xs font-medium text-text-primary">{stage.label}</p>
            <p className="mt-1 text-[11px] text-text-muted">
              {current ? currentState?.replaceAll('_', ' ') : reached ? 'Recorded' : 'Awaiting'}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function normalizedNetwork(value: string | null | undefined) {
  return (value ?? '').replaceAll('-', '_').toUpperCase();
}

export function CapitalAccountView({
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
  const [active, setActive] = useState<Tab>('Capital State');
  const [selectedCapability, setSelectedCapability] = useState(capabilities[0]?.code ?? '');
  const [fundingResult, setFundingResult] = useState<DepositInstruction | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [isFundingPending, startFunding] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const [selectedTransferCapability, setSelectedTransferCapability] = useState(
    transferCapabilities[0]?.code ?? '',
  );
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
      const aliases: Partial<Record<string, Tab>> = {
        balances: 'Capital State',
        deposit: 'Funding',
        withdraw: 'Movement',
        activity: 'Capital Context',
      };
      const matched = tabs.find((tab) => tabHash(tab) === hash) ?? aliases[hash];
      if (matched) setActive(matched);
    };
    synchronizeTab();
    window.addEventListener('hashchange', synchronizeTab);
    return () => window.removeEventListener('hashchange', synchronizeTab);
  }, []);

  const selected = capabilities.find((item) => item.code === selectedCapability);
  const selectedTransfer = transferCapabilities.find(
    (item) => item.code === selectedTransferCapability,
  );
  const verifiedAliases = aliases.filter(
    (item) => item.verification_state === 'verified' && item.activation_state === 'active',
  );
  const selectedTransferBalance = selectedTransfer
    ? balances.find(
        (item) =>
          item.asset === selectedTransfer.asset &&
          normalizedNetwork(item.network) === normalizedNetwork(selectedTransfer.network),
      )
    : undefined;
  const selectedAlias = verifiedAliases.find((item) => item.id === selectedAliasId);
  const activity = useMemo(
    () =>
      [
        ...fundingActivity.map((item) => ({ ...item, kind: 'Funding' as const })),
        ...transferActivity.map((item) => ({ ...item, kind: 'Transfer' as const })),
      ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [fundingActivity, transferActivity],
  );
  const latestFunding = fundingActivity[0];
  const latestTransfer = transferActivity[0];

  const zeroPosition = !balanceError && balances.length === 0;
  const singleBalance = balances.length === 1 ? balances[0] : undefined;

  function selectTab(tab: Tab) {
    setActive(tab);
    window.history.replaceState(null, '', `#${tabHash(tab)}`);
  }

  function beginFunding() {
    if (!selected || selected.state !== 'ENABLED') return;
    setFundingError(null);
    setFundingResult(null);
    startFunding(async () => {
      const result = await createFundingIntentAction(selected.code);
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
      const result = await createTransferAliasAction(
        aliasName,
        destinationType,
        destinationReference,
      );
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
      window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <Stack>
      <WorkspaceHeader
        eyebrow="Capital"
        title="Capital Account"
        description="Understand capital availability, funding routes, movement capability, and account state."
        action={
          <button
            type="button"
            onClick={() => selectTab('Funding')}
            className="inline-flex min-h-11 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover"
          >
            Create funding instruction
          </button>
        }
      />

      <section className="grid gap-5 border-b border-border-hairline pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
            Capital position
          </p>
          <div className="mt-2 text-[2rem] font-medium leading-none tracking-[-0.025em] text-text-primary sm:text-[2.4rem]">
            {balanceError ? (
              'Unavailable'
            ) : zeroPosition ? (
              '0 positions'
            ) : singleBalance ? (
              <FinancialValue
                valueAtomic={singleBalance.total_atomic}
                asset={singleBalance.asset}
              />
            ) : (
              `${balances.length} assets`
            )}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
            {balanceError
              ? 'Balances are temporarily unavailable.'
              : zeroPosition
                ? 'No capital positions yet.'
                : balances.length === 1
                  ? 'Available, pending, reserved, and restricted amounts are shown below.'
                  : 'Balances are shown separately by asset.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTab('Movement')}
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2"
          >
            Request movement
          </button>
          <button
            type="button"
            onClick={() => selectTab('Capital Context')}
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-surface-2"
          >
            Capital context
          </button>
        </div>
      </section>

      <nav
        className="flex overflow-x-auto border-b border-border-hairline"
        role="tablist"
        aria-label="Capital Account sections"
      >
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

      {active === 'Capital State' && (
        <Section title="Capital State">
          <div className="border-y border-border-hairline">
            {balanceError ? (
              <ProductStateMessage state="ERROR" title="Balances unavailable">
                We couldn't load your balances. Try again.
              </ProductStateMessage>
            ) : balances.length === 0 ? (
              <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <ProductStateMessage state="NO_POSITION" title="No capital positions yet" />
                <button
                  type="button"
                  onClick={() => selectTab('Funding')}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-primary px-4 text-sm font-medium text-white hover:bg-accent-primary-hover"
                >
                  Create funding instruction
                </button>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(7rem,1fr)_repeat(5,minmax(7rem,auto))] gap-5 border-b border-border-hairline py-3 text-xs font-medium text-text-muted lg:grid">
                  <span>Asset</span>
                  <span>Total</span>
                  <span>Available</span>
                  <span>Pending</span>
                  <span>Reserved</span>
                  <span>Restricted</span>
                </div>
                {balances.map((balance) => (
                  <div
                    key={`${balance.asset}:${balance.network ?? ''}`}
                    className="grid gap-4 border-b border-border-hairline py-5 last:border-0 lg:grid-cols-[minmax(7rem,1fr)_repeat(5,minmax(7rem,auto))] lg:items-center lg:gap-5"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{balance.asset}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {balance.network ?? 'Denomination'}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:contents">
                      <div>
                        <dt className="text-[11px] text-text-muted lg:hidden">Total</dt>
                        <dd className="mt-1 text-sm font-medium lg:mt-0">
                          <FinancialValue
                            valueAtomic={balance.total_atomic}
                            asset={balance.asset}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-text-muted lg:hidden">Available</dt>
                        <dd className="mt-1 text-sm font-medium lg:mt-0">
                          <FinancialValue
                            valueAtomic={balance.available_atomic}
                            asset={balance.asset}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-text-muted lg:hidden">Pending</dt>
                        <dd className="mt-1 text-sm font-medium lg:mt-0">
                          <FinancialValue
                            valueAtomic={balance.pending_atomic}
                            asset={balance.asset}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-text-muted lg:hidden">Reserved</dt>
                        <dd className="mt-1 text-sm font-medium lg:mt-0">
                          <FinancialValue
                            valueAtomic={balance.reserved_atomic}
                            asset={balance.asset}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-text-muted lg:hidden">Restricted</dt>
                        <dd className="mt-1 text-sm font-medium lg:mt-0">
                          <FinancialValue
                            valueAtomic={balance.restricted_atomic}
                            asset={balance.asset}
                          />
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-text-muted">
            A recorded zero balance is shown as zero. Missing balances remain unavailable.
          </p>
        </Section>
      )}

      {active === 'Funding' && (
        <Section title="Create funding instruction">
          <div className="mb-8">
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-text-muted">Current state</p>
                <div className="mt-2">
                  <ProductStateBadge
                    state={latestFunding ? lifecycleState(latestFunding.state) : 'NO_ACTIVITY'}
                  >
                    {latestFunding ? latestFunding.state.replaceAll('_', ' ') : 'Not established'}
                  </ProductStateBadge>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted">Required next action</p>
                <p className="mt-2 text-sm font-medium text-text-primary">
                  {fundingNextAction(latestFunding?.state)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Authority boundary</p>
                <p className="mt-2 text-sm leading-5 text-text-secondary">
                  Capital becomes available only after provider evidence, ledger posting, and
                  reconciliation.
                </p>
              </div>
            </div>
            <LifecycleTimeline
              label="Funding lifecycle"
              stages={fundingStages}
              {...(latestFunding ? { currentState: latestFunding.state } : {})}
            />
          </div>
          {capabilityError ? (
            <ProductStateMessage state="ERROR" title="Funding unavailable">
              We couldn't load funding route availability. Try again.
            </ProductStateMessage>
          ) : capabilities.length === 0 ? (
            <ProductStateMessage
              state="NOT_CONFIGURED"
              title="Funding is not available for this account yet"
            />
          ) : (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <p className="text-sm font-medium text-text-primary">1. Choose funding route</p>
                <div className="mt-4">
                  <Label htmlFor="deposit-asset">Asset and network</Label>
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
                    {capabilities.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.asset} · {item.network}
                      </option>
                    ))}
                  </select>
                </div>
                {selected ? (
                  <div className="mt-4 flex items-center justify-between gap-4 border-y border-border-hairline py-4">
                    <div>
                      <p className="text-sm font-medium">{selected.asset} funding route</p>
                      <p className="mt-1 text-xs text-text-muted">Network · {selected.network}</p>
                    </div>
                    <ProductStateBadge state={capabilityState(selected.state)}>
                      {selected.state.replaceAll('_', ' ').toLowerCase()}
                    </ProductStateBadge>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">2. Funding instructions</p>
                {!selected || selected.state !== 'ENABLED' ? (
                  <div className="mt-4 border-y border-border-hairline">
                    <ProductStateMessage
                      state={selected ? capabilityState(selected.state) : 'UNAVAILABLE'}
                      title={
                        selected ? `${selected.asset} funding unavailable` : 'Funding unavailable'
                      }
                    >
                      Funding instructions are available only for enabled routes.
                    </ProductStateMessage>
                  </div>
                ) : fundingResult ? (
                  <div className="mt-4 border-y border-border-hairline py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Funding destination</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {selected.asset} · {selected.network}
                        </p>
                      </div>
                      <ProductStateBadge
                        state={fundingResult.state === 'ENABLED' ? 'READY' : 'PENDING'}
                      >
                        {fundingResult.state.replaceAll('_', ' ')}
                      </ProductStateBadge>
                    </div>
                    {fundingResult.deposit_address ? (
                      <div className="mt-5">
                        <p className="text-xs text-text-muted">Address</p>
                        <div className="mt-2 flex items-start gap-2">
                          <p
                            className="min-w-0 flex-1 break-all rounded-md bg-surface-2 px-3 py-2 font-mono text-xs leading-5 text-text-primary"
                            aria-label={`Funding address ${fundingResult.deposit_address}`}
                          >
                            {fundingResult.deposit_address}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyText('address', fundingResult.deposit_address!)}
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-surface-2"
                            aria-label="Copy funding address"
                          >
                            {copied === 'address' ? (
                              <Check className="size-4" aria-hidden="true" />
                            ) : (
                              <Copy className="size-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {fundingResult.memo_or_tag ? (
                      <div className="mt-4">
                        <p className="text-xs text-text-muted">Memo / tag</p>
                        <div className="mt-2 flex items-center gap-2">
                          <p className="min-w-0 flex-1 rounded-md bg-surface-2 px-3 py-2 font-mono text-sm text-text-primary">
                            {fundingResult.memo_or_tag}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyText('memo', fundingResult.memo_or_tag!)}
                            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-surface-2"
                            aria-label="Copy memo or tag"
                          >
                            {copied === 'memo' ? (
                              <Check className="size-4" aria-hidden="true" />
                            ) : (
                              <Copy className="size-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {!fundingResult.deposit_address ? (
                      <p className="mt-4 text-sm leading-6 text-text-muted">
                        Your funding route is still being prepared. Try again shortly.
                      </p>
                    ) : null}
                    <div className="mt-5 border-t border-border-hairline pt-4">
                      <p className="text-xs leading-5 text-text-muted">
                        Send only through the {selected.network} route shown here. Details such as
                        minimums, confirmations, fees, and settlement timing are shown only when
                        available.
                      </p>
                      <p className="sr-only" aria-live="polite">
                        {copied ? `${copied} copied` : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border-y border-border-hairline py-5">
                    <p className="text-sm leading-6 text-text-muted">
                      Continue to request funding instructions. Creating instructions does not
                      credit your account.
                    </p>
                    {fundingError ? (
                      <p className="mt-3 text-sm text-status-danger" role="alert">
                        {fundingError}
                      </p>
                    ) : null}
                    <Button className="mt-4" onClick={beginFunding} disabled={isFundingPending}>
                      {isFundingPending ? 'Preparing instructions…' : 'Continue to instructions'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Section>
      )}

      {active === 'Movement' && (
        <Section title="Movement">
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-text-muted">Current state</p>
              <div className="mt-2">
                <ProductStateBadge
                  state={latestTransfer ? lifecycleState(latestTransfer.state) : 'UNAVAILABLE'}
                >
                  {latestTransfer ? latestTransfer.state.replaceAll('_', ' ') : 'Unavailable'}
                </ProductStateBadge>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted">Required next action</p>
              <p className="mt-2 text-sm font-medium text-text-primary">
                {movementNextAction(latestTransfer?.state)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Authority boundary</p>
              <p className="mt-2 text-sm leading-5 text-text-secondary">
                Approval does not submit or settle a movement; each stage requires separate
                evidence.
              </p>
            </div>
          </div>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]">
            <div className="space-y-5">
              <div>
                <Label htmlFor="withdraw-asset">Asset and network</Label>
                <select
                  id="withdraw-asset"
                  value={selectedTransferCapability}
                  onChange={(event) => setSelectedTransferCapability(event.target.value)}
                  disabled={transferCapabilityError || transferCapabilities.length === 0}
                  className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary disabled:opacity-60"
                >
                  {transferCapabilities.length === 0 ? (
                    <option value="">No movement routes available</option>
                  ) : (
                    transferCapabilities.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.asset} · {item.network}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="withdraw-destination">Destination</Label>
                  <button
                    type="button"
                    onClick={() => selectTab('Destinations')}
                    className="text-xs font-medium text-accent-primary"
                  >
                    Manage destinations
                  </button>
                </div>
                <select
                  id="withdraw-destination"
                  value={selectedAliasId}
                  onChange={(event) => setSelectedAliasId(event.target.value)}
                  disabled={verifiedAliases.length === 0}
                  className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary disabled:opacity-60"
                >
                  <option value="">Select verified destination</option>
                  {verifiedAliases.map((alias) => (
                    <option key={alias.id} value={alias.id}>
                      {alias.alias}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-text-muted">
                  Only verified and active destinations can be reviewed for movement.
                </p>
              </div>
              <div>
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  inputMode="decimal"
                  value={transferAmount}
                  onChange={(event) =>
                    setTransferAmount(event.target.value.replace(/[^0-9.]/g, ''))
                  }
                  placeholder="0.00"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="border-y border-border-hairline py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">Movement review</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Reviewing a movement does not reserve or move capital.
                  </p>
                </div>
                {selectedTransfer ? (
                  <ProductStateBadge state={capabilityState(selectedTransfer.state)}>
                    {selectedTransfer.state.replaceAll('_', ' ').toLowerCase()}
                  </ProductStateBadge>
                ) : null}
              </div>
              <dl className="mt-5 divide-y divide-border-hairline border-y border-border-hairline">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-text-muted">Route</dt>
                  <dd className="text-sm font-medium text-text-primary">
                    {selectedTransfer
                      ? `${selectedTransfer.asset} · ${selectedTransfer.network}`
                      : 'Not selected'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-text-muted">Available</dt>
                  <dd className="text-sm font-medium">
                    {selectedTransfer && selectedTransferBalance ? (
                      <FinancialValue
                        valueAtomic={selectedTransferBalance.available_atomic}
                        asset={selectedTransfer.asset}
                      />
                    ) : (
                      <span className="text-text-muted">Unavailable</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-text-muted">Destination</dt>
                  <dd className="text-sm font-medium text-text-primary">
                    {selectedAlias?.alias ?? 'Not selected'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-text-muted">Amount</dt>
                  <dd className="text-sm font-medium text-text-primary">
                    {transferAmount
                      ? `${transferAmount} ${selectedTransfer?.asset ?? ''}`.trim()
                      : 'Not entered'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-text-muted">Fee</dt>
                  <dd className="text-sm font-medium text-text-muted">Unavailable</dd>
                </div>
              </dl>

              <div className="mt-5">
                {transferCapabilityError ? (
                  <ProductStateMessage state="ERROR" title="Movement unavailable" compact>
                    We couldn't load movement capability. Try again.
                  </ProductStateMessage>
                ) : !selectedTransfer || selectedTransfer.state !== 'ENABLED' ? (
                  <ProductStateMessage
                    state={
                      selectedTransfer ? capabilityState(selectedTransfer.state) : 'UNAVAILABLE'
                    }
                    title="Movement unavailable"
                    compact
                  >
                    This movement route is not available for your account.
                  </ProductStateMessage>
                ) : verifiedAliases.length === 0 ? (
                  <ProductStateMessage
                    state="REQUIRES_APPROVAL"
                    title="Verified destination required"
                    compact
                  >
                    Add a destination and complete verification before reviewing movement.
                  </ProductStateMessage>
                ) : (
                  <ProductStateMessage
                    state="REQUIRES_APPROVAL"
                    title="Movement request unavailable"
                    compact
                  >
                    Movement requests are not available for this account yet. No request has been
                    sent.
                  </ProductStateMessage>
                )}
              </div>
              <Button className="mt-4" disabled>
                Request movement
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <LifecycleTimeline
              label="Movement lifecycle"
              stages={movementStages}
              {...(latestTransfer ? { currentState: latestTransfer.state } : {})}
            />
          </div>
        </Section>
      )}

      {active === 'Destinations' && (
        <Section title="Destinations">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
            <div>
              <p className="text-sm font-medium text-text-primary">Add destination</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Save a movement destination for verification before it can be used.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="destination-label">Label</Label>
                  <Input
                    id="destination-label"
                    value={aliasName}
                    onChange={(event) => setAliasName(event.target.value)}
                    placeholder="Primary treasury destination"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="destination-type">Destination type</Label>
                  <select
                    id="destination-type"
                    value={destinationType}
                    onChange={(event) => setDestinationType(event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-border-default bg-surface-1 px-3 text-sm text-text-primary"
                  >
                    <option value="crypto_address">Crypto address</option>
                    <option value="bank_destination">Bank destination</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="destination-reference">Destination reference</Label>
                  <Input
                    id="destination-reference"
                    value={destinationReference}
                    onChange={(event) => setDestinationReference(event.target.value.trimStart())}
                    placeholder="Address or destination reference"
                    className="mt-2 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  Saving a destination does not verify ownership, network compatibility, or
                  activation.
                </p>
              </div>
              {aliasSubmitError ? (
                <p className="mt-3 text-sm text-status-danger" role="alert">
                  {aliasSubmitError}
                </p>
              ) : null}
              {aliasResult ? (
                <p className="mt-3 text-sm text-text-secondary" role="status">
                  {aliasResult}
                </p>
              ) : null}
              <Button className="mt-4" onClick={saveDestination} disabled={isAliasPending}>
                {isAliasPending ? 'Saving destination…' : 'Save for verification'}
              </Button>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">Saved destinations</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Verification and activation are shown separately.
                  </p>
                </div>
                <span className="text-xs tabular-nums text-text-muted">{aliases.length}</span>
              </div>
              <div className="mt-4 border-y border-border-hairline">
                {aliasError ? (
                  <ProductStateMessage state="ERROR" title="Destinations unavailable">
                    We couldn't load your destinations. Try again.
                  </ProductStateMessage>
                ) : aliases.length === 0 ? (
                  <ProductStateMessage state="NO_ACTIVITY" title="No destinations saved">
                    Add a destination to begin verification.
                  </ProductStateMessage>
                ) : (
                  aliases.map((alias) => (
                    <div
                      key={alias.id}
                      className="grid gap-3 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {alias.alias}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {alias.destination_type.replaceAll('_', ' ')} · added{' '}
                          {new Date(alias.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ProductStateBadge
                          state={
                            alias.verification_state === 'verified' ? 'READY' : 'REQUIRES_APPROVAL'
                          }
                        >
                          {alias.verification_state.replaceAll('_', ' ')}
                        </ProductStateBadge>
                        <span className="text-xs text-text-muted">
                          {alias.activation_state.replaceAll('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      {active === 'Capital Context' && (
        <Section title="Capital Context">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              Funding and movement instructions are shown in one timeline.
            </p>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary"
            >
              Full context <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border-y border-border-hairline">
            {fundingActivityError && transferActivityError ? (
              <ProductStateMessage state="ERROR" title="Capital context unavailable">
                We couldn't load your capital context. Try again.
              </ProductStateMessage>
            ) : activity.length === 0 ? (
              <ProductStateMessage state="NO_ACTIVITY" title="No capital context yet">
                Funding and movement instructions will be shown here.
              </ProductStateMessage>
            ) : (
              activity.map((item) => (
                <div
                  key={`${item.kind}:${item.id}`}
                  className="grid gap-2 border-b border-border-hairline py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {item.kind} · {item.asset}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {item.network ?? item.rail} · {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {item.amount_atomic ? (
                      <FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} />
                    ) : (
                      <span className="text-text-muted">Amount unavailable</span>
                    )}
                  </div>
                  <ProductStateBadge state={lifecycleState(item.state)}>
                    {item.state.replaceAll('_', ' ')}
                  </ProductStateBadge>
                </div>
              ))
            )}
          </div>
        </Section>
      )}
    </Stack>
  );
}
