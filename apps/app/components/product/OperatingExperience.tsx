'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Check,
  Clock3,
  FileText,
  Landmark,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { useProductBootstrap } from './ProductBootstrapProvider';
import { FinancialValue, ProductStateBadge, type ProductStateName } from './ProductState';
import type { CanonicalBalance, FundingCapability, TransferActivity } from '@/lib/api/financial';

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || 'there';
}

function relativeFreshness(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(delta) || delta < 0) return 'Updated recently';
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return 'Updated moments ago';
  if (minutes < 60) return `Updated ${minutes}m ago`;
  return `Updated ${Math.floor(minutes / 60)}h ago`;
}

function enabled(capabilities: readonly FundingCapability[] | undefined) {
  return capabilities?.filter((item) => item.state === 'ENABLED') ?? [];
}

function lifecycleState(state: string): ProductStateName {
  const normalized = state.toUpperCase();
  if (normalized === 'RECONCILED') return 'RECONCILED';
  if (normalized === 'SETTLED' || normalized === 'PROVIDER_SETTLED') return 'SETTLED';
  if (normalized === 'RESERVED') return 'RESERVED';
  if (normalized.includes('APPROVAL') || normalized === 'AUTHORIZED') return 'REQUIRES_APPROVAL';
  if (['FAILED', 'RETURNED', 'REVERSED', 'DISCREPANCY'].includes(normalized)) return 'ERROR';
  return 'PENDING';
}

function PageHeader({ eyebrow, title, description, actions }: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: ReactNode;
}) {
  return <header className="op-page-header">
    <div><p className="op-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
    {actions ? <div className="op-header-actions">{actions}</div> : null}
  </header>;
}

function SectionHeading({ label, title, action }: {
  readonly label: string;
  readonly title: string;
  readonly action?: ReactNode;
}) {
  return <div className="op-section-heading"><div><span>{label}</span><h2>{title}</h2></div>{action}</div>;
}

function EmptyCanvas({ title, detail }: { readonly title: string; readonly detail: string }) {
  return <div className="op-evidence-canvas">
    <div className="op-evidence-grid" aria-hidden="true" />
    <div className="op-evidence-message"><ShieldCheck size={18} aria-hidden="true"/><strong>{title}</strong><p>{detail}</p></div>
  </div>;
}

function BalanceFigure({ balance, field = 'total_atomic', compact = false }: {
  readonly balance: CanonicalBalance | undefined;
  readonly field?: 'total_atomic' | 'available_atomic' | 'reserved_atomic' | 'pending_atomic' | 'restricted_atomic';
  readonly compact?: boolean;
}) {
  if (!balance) return <span className={compact ? 'op-value-compact' : 'op-value'}>—</span>;
  return <FinancialValue valueAtomic={balance[field]} asset={balance.asset} decimals={balance.decimals} className={compact ? 'op-value-compact' : 'op-value'} />;
}

function Metric({ label, balance, field, state }: {
  readonly label: string;
  readonly balance: CanonicalBalance | undefined;
  readonly field: 'available_atomic' | 'reserved_atomic' | 'pending_atomic' | 'total_atomic';
  readonly state: ProductStateName;
}) {
  return <div className="op-metric"><span>{label}</span><BalanceFigure balance={balance} field={field} compact/><ProductStateBadge state={balance ? state : 'UNAVAILABLE'} /></div>;
}

function PrimaryActions() {
  const { snapshot } = useProductBootstrap();
  const funding = snapshot.fundingCapabilities.state === 'READY' ? enabled(snapshot.fundingCapabilities.data) : [];
  const transfers = snapshot.transferCapabilities.state === 'READY' ? enabled(snapshot.transferCapabilities.data) : [];
  return <>
    {funding.length > 0 ? <Link className="op-button op-button-primary" href="/dashboard/deposit"><ArrowDownToLine size={15}/>Deposit</Link> : null}
    {transfers.length > 0 ? <Link className="op-button" href="/dashboard/capital-account#movement">Transfer</Link> : null}
  </>;
}

function ActivityRows({ limit }: { readonly limit?: number }) {
  const { snapshot } = useProductBootstrap();
  if (snapshot.activity.state !== 'READY') return <div className="op-empty-row"><strong>Activity unavailable</strong><span>The account event projection could not be loaded.</span></div>;
  const rows = limit ? snapshot.activity.data.data.slice(0, limit) : snapshot.activity.data.data;
  if (!rows.length) return <div className="op-empty-row"><strong>No account activity yet</strong><span>Governed capital events will appear after they are recorded.</span></div>;
  return <div className="op-activity-list">{rows.map((item) => <div className="op-activity-row" key={item.id}>
    <span className="op-activity-mark" aria-hidden="true"/>
    <div className="op-activity-copy"><strong>{item.type.replaceAll('_', ' ')}</strong><span>{item.reference ?? [item.asset, item.network].filter(Boolean).join(' · ')}</span></div>
    <div className="op-activity-amount"><strong>{item.amount ? `${item.amount} ${item.asset}` : '—'}</strong><ProductStateBadge state={lifecycleState(item.status)}>{item.status.replaceAll('_', ' ')}</ProductStateBadge></div>
    <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
  </div>)}</div>;
}

function balanceContext(balances: readonly CanonicalBalance[]) {
  return balances.length === 1 ? balances[0] : undefined;
}

export function OverviewExperience() {
  const { snapshot } = useProductBootstrap();
  const balances = snapshot.balances.state === 'READY' ? snapshot.balances.data : [];
  const balance = balanceContext(balances);
  const portfolio = snapshot.portfolio.state === 'READY' ? snapshot.portfolio.data : undefined;
  const allocation = snapshot.allocation.state === 'READY' ? snapshot.allocation.data : undefined;
  const notifications = snapshot.notifications.state === 'READY' ? snapshot.notifications.data : [];
  const pendingTransfers = snapshot.transfers.state === 'READY'
    ? snapshot.transfers.data.filter((item) => !['RECONCILED', 'SETTLED', 'FAILED', 'CANCELLED', 'CANCELED'].includes(item.state.toUpperCase()))
    : [];
  const unread = notifications.filter((item) => !item.readAt);

  const allocationLabel = allocation?.reconciled.state === 'VALUE' ? 'Reconciled'
    : allocation?.executed.state === 'VALUE' ? 'Executing'
      : allocation?.authorized.state === 'VALUE' ? 'Approved'
        : allocation?.modeled.state === 'VALUE' ? 'Proposed'
          : allocation ? 'Not configured' : 'Unavailable';

  return <div className="op-stack">
    <PageHeader eyebrow="Overview" title={`Welcome back, ${firstName(snapshot.account.fullName ?? snapshot.account.displayName)}.`} description="Your capital operating state, separated by authority, evidence, and reconciliation." actions={<PrimaryActions/>}/>
    <section className="op-hero">
      <div className="op-hero-primary"><span>Total canonical capital</span>{balances.length === 0 ? <strong>—</strong> : balance ? <BalanceFigure balance={balance}/> : <strong>{balances.length} asset positions</strong>}<p>{balance ? `${balance.asset} · ${balance.network ?? 'canonical ledger'}` : balances.length ? 'Assets remain separated without an authoritative conversion basis.' : 'No canonical balance is currently available.'}</p><small>{relativeFreshness(snapshot.asOf)} · Canonical ledger</small></div>
      <div className="op-metric-grid"><Metric label="Available" balance={balance} field="available_atomic" state="AVAILABLE"/><Metric label="Reserved" balance={balance} field="reserved_atomic" state="RESERVED"/><Metric label="Pending" balance={balance} field="pending_atomic" state="PENDING"/></div>
    </section>
    <section className="op-panel op-chart-panel"><SectionHeading label="Portfolio" title="Reconciled valuation" action={<Link href="/dashboard/portfolio">Open portfolio <ArrowRight size={14}/></Link>}/>{portfolio?.performance.state === 'VALUE' ? <div className="op-empty-row"><strong>Performance data requires a typed chart projection</strong><span>Neptlium will not infer a curve from opaque data.</span></div> : <EmptyCanvas title="Portfolio history is not available yet" detail="A performance chart will appear only after reconciled valuation history is exposed by the canonical portfolio projection."/>}</section>
    <section className="op-grid-2">
      <article className="op-panel"><SectionHeading label="Treasury" title="Liquidity readiness" action={<Link href="/dashboard/treasury">Open <ArrowRight size={14}/></Link>}/><div className="op-summary-list"><Metric label="Available" balance={balance} field="available_atomic" state="AVAILABLE"/><Metric label="Reserved" balance={balance} field="reserved_atomic" state="RESERVED"/><Metric label="Pending settlement" balance={balance} field="pending_atomic" state="PENDING"/></div></article>
      <article className="op-panel"><SectionHeading label="Allocation" title="Decision state" action={<Link href="/dashboard/allocation">Review <ArrowRight size={14}/></Link>}/><div className="op-state-focus"><SlidersHorizontal size={19}/><div><strong>{allocationLabel}</strong><p>Model, approval, reservation, execution and reconciliation remain distinct governed states.</p></div></div></article>
    </section>
    {pendingTransfers.length || unread.length ? <section className="op-panel"><SectionHeading label="Next actions" title="Attention"/><div className="op-action-list">{pendingTransfers.slice(0, 3).map((item) => <Link key={item.id} href="/dashboard/treasury"><Clock3 size={16}/><span><strong>Review {item.asset} movement</strong><small>{item.state.replaceAll('_', ' ')}</small></span><ArrowRight size={15}/></Link>)}{unread.length ? <Link href="/dashboard/notifications"><Bell size={16}/><span><strong>Review notifications</strong><small>{unread.length} unread</small></span><ArrowRight size={15}/></Link> : null}</div></section> : null}
    <section className="op-panel"><SectionHeading label="Activity" title="Recent account events" action={<Link href="/dashboard/activity">View all <ArrowRight size={14}/></Link>}/><ActivityRows limit={6}/></section>
  </div>;
}

export function CapitalExperience() {
  const { snapshot } = useProductBootstrap();
  const balances = snapshot.balances.state === 'READY' ? snapshot.balances.data : [];
  const balance = balanceContext(balances);
  const funding = snapshot.fundingCapabilities.state === 'READY' ? snapshot.fundingCapabilities.data : [];
  const activity = snapshot.fundingActivity.state === 'READY' ? snapshot.fundingActivity.data : [];
  const liveFunding = enabled(funding);
  const liveTransfers = snapshot.transferCapabilities.state === 'READY' ? enabled(snapshot.transferCapabilities.data) : [];
  const total = balance ? BigInt(balance.total_atomic) : 0n;
  const availablePercent = balance && total > 0n ? Number((BigInt(balance.available_atomic) * 10_000n) / total) / 100 : 0;
  const reservedPercent = balance && total > 0n ? Number((BigInt(balance.reserved_atomic) * 10_000n) / total) / 100 : 0;
  const pendingPercent = Math.max(0, 100 - availablePercent - reservedPercent);

  return <div className="op-stack">
    <PageHeader eyebrow="Capital" title="Capital" description="Authoritative customer capital from the Neptlium canonical ledger." actions={<PrimaryActions/>}/>
    <section className="op-hero"><div className="op-hero-primary"><span>Total canonical capital</span>{balances.length === 0 ? <strong>—</strong> : balance ? <BalanceFigure balance={balance}/> : <strong>{balances.length} asset positions</strong>}<p>{balance ? `${balance.asset} · ${balance.network ?? 'canonical ledger'}` : balances.length ? 'Values remain separated by asset.' : 'Canonical capital is unavailable or empty.'}</p><small>{relativeFreshness(snapshot.asOf)}</small></div><div className="op-metric-grid"><Metric label="Available" balance={balance} field="available_atomic" state="AVAILABLE"/><Metric label="Reserved" balance={balance} field="reserved_atomic" state="RESERVED"/><Metric label="Pending" balance={balance} field="pending_atomic" state="PENDING"/></div></section>
    <section className="op-panel"><SectionHeading label="State" title="Capital breakdown"/>{balance && total > 0n ? <div className="op-capital-breakdown"><div className="op-breakdown-bar"><i style={{width:`${availablePercent}%`}}/><i style={{width:`${reservedPercent}%`}}/><i style={{width:`${pendingPercent}%`}}/></div><div className="op-breakdown-legend"><span><i/>Available {availablePercent.toFixed(1)}%</span><span><i/>Reserved {reservedPercent.toFixed(1)}%</span><span><i/>Pending {pendingPercent.toFixed(1)}%</span></div></div> : <div className="op-empty-row"><strong>Proportions unavailable</strong><span>Ratios are shown only when one authoritative capital basis exists.</span></div>}</section>
    <section className="op-grid-2">
      <article className="op-panel"><SectionHeading label="Funding" title="Live routes" action={liveFunding.length ? <Link href="/dashboard/deposit">Deposit <ArrowRight size={14}/></Link> : null}/><div className="op-row-list">{funding.length ? funding.map((item) => <div className="op-data-row" key={item.code}><span><strong>{item.asset}</strong><small>{item.network}</small></span><ProductStateBadge state={item.state === 'ENABLED' ? 'READY' : item.state === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'CAPABILITY_DISABLED'}>{item.state.replaceAll('_',' ')}</ProductStateBadge></div>) : <div className="op-empty-row"><strong>No funding routes reported</strong><span>No rail is presented as live.</span></div>}</div></article>
      <article className="op-panel"><SectionHeading label="Funding" title="Latest intents"/><div className="op-row-list">{activity.length ? activity.slice(0,5).map((item) => <div className="op-data-row" key={item.id}><span><strong>{item.asset} · {item.rail}</strong><small>{new Date(item.updated_at).toLocaleString()}</small></span><ProductStateBadge state={lifecycleState(item.state)}>{item.state.replaceAll('_',' ')}</ProductStateBadge></div>) : <div className="op-empty-row"><strong>No funding intents</strong><span>Funding intent history will appear once created.</span></div>}</div></article>
    </section>
    <section className="op-panel"><SectionHeading label="History" title="Capital activity"/><ActivityRows/></section>
    <p className="op-footnote">Outbound actions remain hidden unless live capability exists. Enabled outbound routes: {liveTransfers.length}.</p>
  </div>;
}

export function TreasuryExperience() {
  const { snapshot } = useProductBootstrap();
  const balances = snapshot.balances.state === 'READY' ? snapshot.balances.data : [];
  const balance = balanceContext(balances);
  const funding = snapshot.fundingCapabilities.state === 'READY' ? snapshot.fundingCapabilities.data : [];
  const destinations = snapshot.destinations.state === 'READY' ? snapshot.destinations.data : [];
  const transfers = snapshot.transfers.state === 'READY' ? snapshot.transfers.data : [];
  const outbound = snapshot.transferCapabilities.state === 'READY' ? enabled(snapshot.transferCapabilities.data) : [];

  return <div className="op-stack">
    <PageHeader eyebrow="Treasury" title="Treasury" description="Liquidity, movement readiness, destinations, settlement and reconciliation." actions={<PrimaryActions/>}/>
    <section className="op-metric-strip"><Metric label="Available" balance={balance} field="available_atomic" state="AVAILABLE"/><Metric label="Pending settlement" balance={balance} field="pending_atomic" state="PENDING"/><Metric label="Reserved" balance={balance} field="reserved_atomic" state="RESERVED"/></section>
    <section className="op-grid-2">
      <article className="op-panel"><SectionHeading label="Deposit routes" title="Funding readiness"/><div className="op-row-list">{funding.length ? funding.map((item) => <div className="op-data-row" key={item.code}><span><strong>{item.asset} · {item.network}</strong><small>{item.code}</small></span><ProductStateBadge state={item.state === 'ENABLED' ? 'READY' : item.state === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'CAPABILITY_DISABLED'}>{item.state.replaceAll('_',' ')}</ProductStateBadge></div>) : <div className="op-empty-row"><strong>No verified funding routes</strong><span>Unsupported rails are not shown as available.</span></div>}</div></article>
      <article className="op-panel"><SectionHeading label="Destinations" title="Withdrawal destinations" action={outbound.length ? <Link href="/dashboard/capital-account#destinations">Add destination <ArrowRight size={14}/></Link> : null}/><div className="op-row-list">{destinations.length ? destinations.map((item) => <div className="op-data-row" key={item.id}><span><strong>{item.alias}</strong><small>{item.destination_type.replaceAll('_',' ')}</small></span><ProductStateBadge state={item.verification_state === 'verified' && item.activation_state === 'active' ? 'READY' : 'REQUIRES_APPROVAL'}>{item.verification_state.replaceAll('_',' ')}</ProductStateBadge></div>) : <div className="op-empty-row"><strong>No destinations saved</strong><span>A destination is never inferred from provider state.</span></div>}</div></article>
    </section>
    <section className="op-panel"><SectionHeading label="Movements" title="Settlement lifecycle"/><div className="op-transfer-list">{transfers.length ? transfers.map((item: TransferActivity) => <div className="op-transfer-row" key={item.id}><div><strong>{item.asset} · {item.network ?? item.rail}</strong><span>{new Date(item.created_at).toLocaleString()}</span></div><FinancialValue valueAtomic={item.amount_atomic} asset={item.asset} decimals={item.decimals} className="op-value-small"/><ProductStateBadge state={lifecycleState(item.state)}>{item.state.replaceAll('_',' ')}</ProductStateBadge></div>) : <div className="op-empty-row"><strong>No movements yet</strong><span>Initiated, settled and reconciled movements remain visibly distinct.</span></div>}</div></section>
  </div>;
}

export function PortfolioExperience() {
  const { snapshot } = useProductBootstrap();
  return <div className="op-stack">
    <PageHeader eyebrow="Portfolio" title="Portfolio" description="Reconciled investments, valuation and position evidence."/>
    <section className="op-hero"><div className="op-hero-primary"><span>Portfolio value</span><strong>—</strong><p>Canonical valuation unavailable.</p><small>{relativeFreshness(snapshot.asOf)} · Reconciliation required</small></div><div className="op-metric-grid"><div className="op-metric"><span>Today</span><strong>—</strong><ProductStateBadge state="UNAVAILABLE"/></div><div className="op-metric"><span>Total return</span><strong>—</strong><ProductStateBadge state="UNAVAILABLE"/></div><div className="op-metric"><span>Reconciliation</span><strong>—</strong><ProductStateBadge state="UNAVAILABLE"/></div></div></section>
    <section className="op-panel op-chart-panel"><SectionHeading label="History" title="Portfolio value"/><EmptyCanvas title="Reconciled valuation history is not available" detail="No decorative or interpolated performance curve is rendered. History appears only from an authoritative valuation series."/></section>
    <section className="op-grid-2"><article className="op-panel"><SectionHeading label="Allocation" title="Portfolio composition"/><EmptyCanvas title="Position allocation unavailable" detail="Asset weights require canonical positions and valuation. Unknown allocation is not rendered as zero."/></article><article className="op-panel"><SectionHeading label="Positions" title="Holdings"/><div className="op-empty-row"><strong>No canonical positions are available</strong><span>Quantity, price, cost basis and return stay absent until provided by the portfolio projection.</span></div></article></section>
  </div>;
}

export function AllocationExperience() {
  const { snapshot } = useProductBootstrap();
  const allocation = snapshot.allocation.state === 'READY' ? snapshot.allocation.data : undefined;
  const steps = [allocation?.modeled, allocation?.authorized, allocation?.authorized, allocation?.executed, allocation?.executed, allocation?.reconciled];
  const labels = ['MODEL','REVIEW','APPROVE','RESERVE','EXECUTE','RECONCILE'];
  const current = allocation?.reconciled.state === 'VALUE' ? 'Reconciled' : allocation?.executed.state === 'VALUE' ? 'Executing' : allocation?.authorized.state === 'VALUE' ? 'Approved' : allocation?.modeled.state === 'VALUE' ? 'Proposed' : allocation ? 'Not configured' : 'Unavailable';
  const badge: ProductStateName = current === 'Reconciled' ? 'RECONCILED' : current === 'Executing' ? 'PENDING' : current === 'Approved' ? 'REQUIRES_APPROVAL' : current === 'Proposed' ? 'PENDING' : current === 'Unavailable' ? 'UNAVAILABLE' : 'NOT_CONFIGURED';
  return <div className="op-stack">
    <PageHeader eyebrow="Allocation" title="Allocation" description="Capital decisions remain separate from approval, reservation, execution and reconciliation."/>
    <section className="op-state-hero"><span>Current state</span><strong>{current}</strong><ProductStateBadge state={badge}/></section>
    <section className="op-panel"><SectionHeading label="Lifecycle" title="Governed progression"/><div className="op-lifecycle">{labels.map((label,index) => { const complete = steps[index]?.state === 'VALUE'; return <div className={complete ? 'is-complete' : ''} key={label}><i>{complete ? <Check size={13}/> : index + 1}</i><span>{label}</span></div>; })}</div></section>
    <section className="op-grid-2"><article className="op-panel"><SectionHeading label="Current" title="Observed portfolio"/><EmptyCanvas title="Observed allocation unavailable" detail="Current weights are not inferred without canonical positions and valuation."/></article><article className="op-panel"><SectionHeading label="Target" title="Authorized allocation"/><EmptyCanvas title={current === 'Not configured' ? 'No allocation configured' : 'Target projection unavailable'} detail="Target weights appear only when the governed allocation model exposes an authoritative typed projection."/></article></section>
    <section className="op-panel"><SectionHeading label="Decision record" title="Authority boundaries"/><div className="op-governance-grid"><div><Layers3 size={17}/><strong>Model</strong><p>Defines a proposed capital arrangement.</p></div><div><ShieldCheck size={17}/><strong>Approval</strong><p>Records explicit authority separately from modeling.</p></div><div><Wallet size={17}/><strong>Reservation</strong><p>Prevents capital from being promised twice.</p></div><div><Landmark size={17}/><strong>Reconciliation</strong><p>Certifies executed state against evidence.</p></div></div></section>
  </div>;
}

export function ActivityExperience() {
  return <div className="op-stack"><PageHeader eyebrow="Records" title="Activity" description="A chronological record of governed capital events and state transitions."/><section className="op-panel"><SectionHeading label="Account activity" title="Capital event stream"/><ActivityRows/></section></div>;
}

export function MoreExperience() {
  const items = [
    ['/dashboard/treasury','Treasury','Liquidity, destinations and movements',Landmark],
    ['/dashboard/allocation','Allocation','Governed capital decisions',SlidersHorizontal],
    ['/dashboard/companies','Companies','Investment entities and context',Layers3],
    ['/dashboard/documents','Documents','Statements and account files',FileText],
    ['/dashboard/notifications','Notifications','Account and lifecycle notices',Bell],
    ['/dashboard/settings','Settings','Profile, organization and security',ShieldCheck],
  ] as const;
  return <div className="op-stack"><PageHeader eyebrow="Workspace" title="More" description="Additional operating surfaces for your Neptlium account."/><section className="op-more-grid">{items.map(([href,title,detail,Icon]) => <Link key={href} href={href}><Icon size={18}/><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={15}/></Link>)}</section></div>;
}
