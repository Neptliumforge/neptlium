'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Check,
  Clock3,
  CircleDollarSign,
  FileText,
  Landmark,
  Layers3,
  MoveRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useProductBootstrap } from './ProductBootstrapProvider';
import { FinancialValue, ProductStateBadge, type ProductStateName } from './ProductState';
import type { CanonicalBalance, FundingCapability } from '@/lib/api/financial';

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

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="op-page-header">
      <div>
        <p className="op-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="op-header-actions">{actions}</div> : null}
    </header>
  );
}

function SectionHeading({
  label,
  title,
  action,
}: {
  readonly label: string;
  readonly title: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="op-section-heading">
      <div>
        <span>{label}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EmptyCanvas({ title, detail }: { readonly title: string; readonly detail: string }) {
  return (
    <div className="op-evidence-canvas">
      <div className="op-evidence-grid" aria-hidden="true" />
      <div className="op-evidence-message">
        <ShieldCheck size={18} aria-hidden="true" />
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function BalanceFigure({
  balance,
  field = 'total_atomic',
  compact = false,
}: {
  readonly balance: CanonicalBalance | undefined;
  readonly field?:
    | 'total_atomic'
    | 'available_atomic'
    | 'reserved_atomic'
    | 'pending_atomic'
    | 'restricted_atomic';
  readonly compact?: boolean;
}) {
  if (!balance) return <span className={compact ? 'op-value-compact' : 'op-value'}>—</span>;
  return (
    <FinancialValue
      valueAtomic={balance[field]}
      asset={balance.asset}
      decimals={balance.decimals}
      className={compact ? 'op-value-compact' : 'op-value'}
    />
  );
}

function Metric({
  label,
  balance,
  field,
  state,
}: {
  readonly label: string;
  readonly balance: CanonicalBalance | undefined;
  readonly field: 'available_atomic' | 'reserved_atomic' | 'pending_atomic' | 'total_atomic';
  readonly state: ProductStateName;
}) {
  return (
    <div className="op-metric">
      <span>{label}</span>
      <BalanceFigure balance={balance} field={field} compact />
      <ProductStateBadge state={balance ? state : 'UNAVAILABLE'} />
    </div>
  );
}

function PrimaryActions() {
  const { snapshot } = useProductBootstrap();
  const funding =
    snapshot.fundingCapabilities.state === 'READY'
      ? enabled(snapshot.fundingCapabilities.data)
      : [];
  const transfers =
    snapshot.transferCapabilities.state === 'READY'
      ? enabled(snapshot.transferCapabilities.data)
      : [];
  const canFund = funding.length > 0;
  const canMove = transfers.length > 0;

  return (
    <>
      <Link
        className="op-button op-button-primary"
        href={canFund ? '/dashboard/deposit' : '/dashboard/capital'}
      >
        <ArrowDownToLine size={15} />
        {canFund ? 'Deposit' : 'Review funding'}
      </Link>
      <Link className="op-button" href="/dashboard/invest">
        <TrendingUp size={15} />
        Invest
      </Link>
      <Link className="op-button" href={canMove ? '/dashboard/transfer' : '/dashboard/capital'}>
        <MoveRight size={15} />
        Transfer
      </Link>
      <Link className="op-button" href={canMove ? '/dashboard/withdrawals' : '/dashboard/capital'}>
        <CircleDollarSign size={15} />
        Withdraw
      </Link>
    </>
  );
}

function ActivityRows({ limit }: { readonly limit?: number }) {
  const { snapshot } = useProductBootstrap();
  if (snapshot.activity.state !== 'READY')
    return (
      <div className="op-empty-row">
        <strong>Activity unavailable</strong>
        <span>The account event projection could not be loaded.</span>
      </div>
    );
  const rows = limit ? snapshot.activity.data.data.slice(0, limit) : snapshot.activity.data.data;
  if (!rows.length)
    return (
      <div className="op-empty-row">
        <strong>No account activity yet</strong>
        <span>Governed capital events will appear after they are recorded.</span>
      </div>
    );
  return (
    <div className="op-activity-list">
      {rows.map((item) => (
        <div className="op-activity-row" key={item.id}>
          <span className="op-activity-mark" aria-hidden="true" />
          <div className="op-activity-copy">
            <strong>{item.type.replaceAll('_', ' ')}</strong>
            <span>{item.reference ?? [item.asset, item.network].filter(Boolean).join(' · ')}</span>
          </div>
          <div className="op-activity-amount">
            <strong>{item.amount ? `${item.amount} ${item.asset}` : '—'}</strong>
            <ProductStateBadge state={lifecycleState(item.status)}>
              {item.status.replaceAll('_', ' ')}
            </ProductStateBadge>
          </div>
          <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
        </div>
      ))}
    </div>
  );
}

function balanceContext(balances: readonly CanonicalBalance[]) {
  return balances.length === 1 ? balances[0] : undefined;
}

export function OverviewExperience() {
  const { snapshot } = useProductBootstrap();
  const balances = snapshot.balances.state === 'READY' ? snapshot.balances.data : [];
  const balance = balanceContext(balances);
  const portfolio = snapshot.portfolio.state === 'READY' ? snapshot.portfolio.data : undefined;
  const notifications = snapshot.notifications.state === 'READY' ? snapshot.notifications.data : [];
  const pendingTransfers =
    snapshot.transfers.state === 'READY'
      ? snapshot.transfers.data.filter(
          (item) =>
            !['RECONCILED', 'SETTLED', 'FAILED', 'CANCELLED', 'CANCELED'].includes(
              item.state.toUpperCase(),
            ),
        )
      : [];
  const unread = notifications.filter((item) => !item.readAt);

  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Overview"
        title="Your capital at a glance"
        description={`Welcome back, ${firstName(snapshot.account.fullName ?? snapshot.account.displayName)}. Review available capital, portfolio state and recent governed activity.`}
        actions={<PrimaryActions />}
      />
      <section className="op-hero">
        <div className="op-hero-primary">
          <span>Your capital</span>
          {balances.length === 0 ? (
            <strong>—</strong>
          ) : balance ? (
            <BalanceFigure balance={balance} />
          ) : (
            <strong>{balances.length} asset positions</strong>
          )}
          <p>
            {balance
              ? `${balance.asset}${balance.network ? ` · ${balance.network}` : ''}`
              : balances.length
                ? 'Shown separately because no verified combined valuation is available.'
                : 'Your capital balance is not available yet.'}
          </p>
          <small>{relativeFreshness(snapshot.asOf)}</small>
        </div>
        <div className="op-metric-grid">
          <Metric
            label="Available to invest"
            balance={balance}
            field="available_atomic"
            state="AVAILABLE"
          />
          <Metric label="On hold" balance={balance} field="reserved_atomic" state="RESERVED" />
          <Metric label="Processing" balance={balance} field="pending_atomic" state="PENDING" />
        </div>
      </section>
      <section className="op-panel op-chart-panel">
        <SectionHeading
          label="Portfolio"
          title="Performance"
          action={
            <Link href="/dashboard/portfolio">
              View portfolio <ArrowRight size={14} />
            </Link>
          }
        />
        {portfolio?.performance.state === 'VALUE' ? (
          <div className="op-empty-row">
            <strong>Performance view is being prepared</strong>
            <span>Your recorded performance data cannot yet be displayed as a chart.</span>
          </div>
        ) : (
          <EmptyCanvas
            title="Performance is not available yet"
            detail="Your performance history will appear when verified valuation history is available."
          />
        )}
      </section>
      <section className="op-grid-2">
        <article className="op-panel">
          <SectionHeading
            label="Invest"
            title="Discover investments"
            action={
              <Link href="/dashboard/invest">
                Explore <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="op-state-focus">
            <Search size={19} />
            <div>
              <strong>Opportunities appear only when available to your account.</strong>
              <p>
                Browse supported investments without mistaking research coverage for an investment
                you own.
              </p>
            </div>
          </div>
        </article>
        <article className="op-panel">
          <SectionHeading
            label="Portfolio"
            title="Your investments"
            action={
              <Link href="/dashboard/portfolio">
                View <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="op-state-focus">
            <Wallet size={19} />
            <div>
              <strong>
                {portfolio ? 'Portfolio information loaded' : 'No portfolio information available'}
              </strong>
              <p>Positions and returns appear only when supported by your account records.</p>
            </div>
          </div>
        </article>
      </section>
      {pendingTransfers.length || unread.length ? (
        <section className="op-panel">
          <SectionHeading label="Next actions" title="Needs your attention" />
          <div className="op-action-list">
            {pendingTransfers.slice(0, 3).map((item) => (
              <Link key={item.id} href="/dashboard/activity">
                <Clock3 size={16} />
                <span>
                  <strong>Review {item.asset} transfer</strong>
                  <small>{item.state.replaceAll('_', ' ')}</small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ))}
            {unread.length ? (
              <Link href="/dashboard/notifications">
                <Bell size={16} />
                <span>
                  <strong>Review notifications</strong>
                  <small>{unread.length} unread</small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
      <section className="op-panel">
        <SectionHeading
          label="Activity"
          title="Recent activity"
          action={
            <Link href="/dashboard/activity">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        <ActivityRows limit={6} />
      </section>
    </div>
  );
}

export function CapitalExperience() {
  const { snapshot } = useProductBootstrap();
  const balances = snapshot.balances.state === 'READY' ? snapshot.balances.data : [];
  const balance = balanceContext(balances);
  const funding =
    snapshot.fundingCapabilities.state === 'READY' ? snapshot.fundingCapabilities.data : [];
  const activity = snapshot.fundingActivity.state === 'READY' ? snapshot.fundingActivity.data : [];
  const liveFunding = enabled(funding);
  const transferCapabilitiesAvailable = snapshot.transferCapabilities.state === 'READY';
  const liveTransfers = transferCapabilitiesAvailable
    ? enabled(snapshot.transferCapabilities.data)
    : [];
  const total = balance ? BigInt(balance.total_atomic) : 0n;
  const availablePercent =
    balance && total > 0n ? Number((BigInt(balance.available_atomic) * 10_000n) / total) / 100 : 0;
  const reservedPercent =
    balance && total > 0n ? Number((BigInt(balance.reserved_atomic) * 10_000n) / total) / 100 : 0;
  const pendingPercent = Math.max(0, 100 - availablePercent - reservedPercent);

  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Capital"
        title="Capital actions"
        description="Deposit, transfer and withdraw through routes currently available to your account."
        actions={<PrimaryActions />}
      />
      <section className="op-hero">
        <div className="op-hero-primary">
          <span>Your capital</span>
          {balances.length === 0 ? (
            <strong>—</strong>
          ) : balance ? (
            <BalanceFigure balance={balance} />
          ) : (
            <strong>{balances.length} asset positions</strong>
          )}
          <p>
            {balance
              ? `${balance.asset}${balance.network ? ` · ${balance.network}` : ''}`
              : balances.length
                ? 'Values remain separated by asset.'
                : 'Your capital balance is not available yet.'}
          </p>
          <small>{relativeFreshness(snapshot.asOf)}</small>
        </div>
        <div className="op-metric-grid">
          <Metric
            label="Available to invest"
            balance={balance}
            field="available_atomic"
            state="AVAILABLE"
          />
          <Metric label="On hold" balance={balance} field="reserved_atomic" state="RESERVED" />
          <Metric label="Processing" balance={balance} field="pending_atomic" state="PENDING" />
        </div>
      </section>
      <section className="op-panel">
        <SectionHeading label="State" title="Capital breakdown" />
        {balance && total > 0n ? (
          <div className="op-capital-breakdown">
            <div className="op-breakdown-bar">
              <i style={{ width: `${availablePercent}%` }} />
              <i style={{ width: `${reservedPercent}%` }} />
              <i style={{ width: `${pendingPercent}%` }} />
            </div>
            <div className="op-breakdown-legend">
              <span>
                <i />
                Available {availablePercent.toFixed(1)}%
              </span>
              <span>
                <i />
                Reserved {reservedPercent.toFixed(1)}%
              </span>
              <span>
                <i />
                Pending {pendingPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="op-empty-row">
            <strong>Proportions unavailable</strong>
            <span>Ratios are shown only when one authoritative capital basis exists.</span>
          </div>
        )}
      </section>
      <section className="op-grid-2">
        <article className="op-panel">
          <SectionHeading
            label="Funding"
            title="Live routes"
            action={
              liveFunding.length ? (
                <Link href="/dashboard/deposit">
                  Deposit <ArrowRight size={14} />
                </Link>
              ) : null
            }
          />
          <div className="op-row-list">
            {snapshot.fundingCapabilities.state !== 'READY' ? (
              <div className="op-empty-row">
                <strong>Funding capability unavailable</strong>
                <span>
                  Funding routes could not be loaded. No rail is presented as disabled or available
                  without authoritative capability state.
                </span>
              </div>
            ) : funding.length ? (
              funding.map((item) => (
                <div className="op-data-row" key={item.code}>
                  <span>
                    <strong>{item.asset}</strong>
                    <small>{item.network}</small>
                  </span>
                  <ProductStateBadge
                    state={
                      item.state === 'ENABLED'
                        ? 'READY'
                        : item.state === 'NOT_CONFIGURED'
                          ? 'NOT_CONFIGURED'
                          : 'CAPABILITY_DISABLED'
                    }
                  >
                    {item.state.replaceAll('_', ' ')}
                  </ProductStateBadge>
                </div>
              ))
            ) : (
              <div className="op-empty-row">
                <strong>No funding routes reported</strong>
                <span>The authoritative capability response contains no funding routes.</span>
              </div>
            )}
          </div>
        </article>
        <article className="op-panel">
          <SectionHeading label="Funding" title="Latest intents" />
          <div className="op-row-list">
            {activity.length ? (
              activity.slice(0, 5).map((item) => (
                <div className="op-data-row" key={item.id}>
                  <span>
                    <strong>
                      {item.asset} · {item.rail}
                    </strong>
                    <small>{new Date(item.updated_at).toLocaleString()}</small>
                  </span>
                  <ProductStateBadge state={lifecycleState(item.state)}>
                    {item.state.replaceAll('_', ' ')}
                  </ProductStateBadge>
                </div>
              ))
            ) : (
              <div className="op-empty-row">
                <strong>No funding intents</strong>
                <span>Funding intent history will appear once created.</span>
              </div>
            )}
          </div>
        </article>
      </section>
      <section className="op-panel">
        <SectionHeading label="History" title="Capital activity" />
        <ActivityRows />
      </section>
      <p className="op-footnote">
        {transferCapabilitiesAvailable ? (
          <>
            Outbound actions remain hidden unless live capability exists. Enabled outbound routes:{' '}
            {liveTransfers.length}.
          </>
        ) : (
          <>
            Outbound capability unavailable. Transfer actions remain hidden until authoritative
            capability state is available.
          </>
        )}
      </p>
    </div>
  );
}

export function PortfolioExperience() {
  const { snapshot } = useProductBootstrap();
  const portfolio = snapshot.portfolio.state === 'READY' ? snapshot.portfolio.data : undefined;
  const portfolioAvailable = portfolio !== undefined;
  const positionState = portfolio?.positions.state ?? 'UNAVAILABLE';
  const performanceState = portfolio?.performance.state ?? 'UNAVAILABLE';
  const valueState = portfolio?.value.state ?? 'UNAVAILABLE';
  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Portfolio"
        title="Your portfolio"
        description="Positions, allocation and performance supported by your account records."
        actions={
          <>
            <Link className="op-button op-button-primary" href="/dashboard/invest">
              Explore investments <ArrowRight size={14} />
            </Link>
            <Link className="op-button" href="/dashboard/activity">
              View activity
            </Link>
          </>
        }
      />
      <nav className="op-section-nav" aria-label="Portfolio sections">
        {['Overview', 'Positions', 'Allocation', 'Performance', 'Income', 'Documents'].map(
          (label) => (
            <a key={label} href={`#${label.toLowerCase()}`}>
              {label}
            </a>
          ),
        )}
      </nav>
      <section className="op-hero" id="overview" aria-labelledby="portfolio-overview-title">
        <div className="op-hero-primary">
          <span id="portfolio-overview-title">Portfolio value</span>
          <strong>—</strong>
          <p>
            {valueState === 'UNAVAILABLE'
              ? 'Portfolio valuation is not available yet.'
              : 'A portfolio value exists, but this client does not yet receive a displayable amount.'}
          </p>
          <small>{relativeFreshness(snapshot.asOf)} · Account records required</small>
        </div>
        <div className="op-metric-grid">
          <div className="op-metric">
            <span>Available capital</span>
            <strong>—</strong>
            <ProductStateBadge state="UNAVAILABLE" />
          </div>
          <div className="op-metric">
            <span>Total return</span>
            <strong>—</strong>
            <ProductStateBadge state={performanceState === 'VALUE' ? 'AVAILABLE' : 'UNAVAILABLE'} />
          </div>
          <div className="op-metric">
            <span>Positions</span>
            <strong>—</strong>
            <ProductStateBadge state={positionState === 'VALUE' ? 'AVAILABLE' : 'UNAVAILABLE'} />
          </div>
        </div>
      </section>
      <section className="op-panel" id="positions" aria-labelledby="portfolio-positions-title">
        <SectionHeading label="Positions" title="What you own" />
        <div className="op-empty-row">
          <strong id="portfolio-positions-title">
            {positionState === 'EMPTY'
              ? 'No investment positions are recorded'
              : 'Investment positions are not available'}
          </strong>
          <span>
            Quantity, price, cost basis and return stay absent until the portfolio projection
            provides authoritative investment-position records. Capital balances are not presented
            as investments.
          </span>
        </div>
      </section>
      <section className="op-grid-2" id="allocation" aria-labelledby="portfolio-allocation-title">
        <article className="op-panel">
          <SectionHeading label="Allocation" title="Portfolio composition" />
          <EmptyCanvas
            title="Position allocation unavailable"
            detail="Asset weights require canonical investment positions and valuation. Unknown allocation is not rendered as zero."
          />
        </article>
        <article className="op-panel">
          <SectionHeading label="Concentration" title="Exposure" />
          <EmptyCanvas
            title="Exposure is not established"
            detail="Sector, geography and asset-class concentration appear only when supported by classified portfolio positions."
          />
        </article>
      </section>
      <section className="op-panel op-chart-panel" id="performance">
        <SectionHeading label="Performance" title="Portfolio value over time" />
        <EmptyCanvas
          title="Reconciled valuation history is not available"
          detail="No decorative or interpolated performance curve is rendered. History appears only from an authoritative valuation series."
        />
      </section>
      <section className="op-grid-2">
        <article className="op-panel">
          <div id="income">
            <SectionHeading label="Income" title="Distributions and income" />
            <div className="op-empty-row">
              <strong>No income records are available</strong>
              <span>
                Dividends, interest and distributions appear only when linked to an authoritative
                portfolio position and account record.
              </span>
            </div>
          </div>
        </article>
        <article className="op-panel">
          <div id="documents">
            <SectionHeading
              label="Documents"
              title="Portfolio records"
              action={
                <Link href="/dashboard/documents">
                  View documents <ArrowRight size={14} />
                </Link>
              }
            />
            <div className="op-empty-row">
              <strong>Statements and account files</strong>
              <span>
                Documents are kept in the account record and are never inferred from a position or
                public-market source.
              </span>
            </div>
          </div>
        </article>
      </section>
      <p className="op-footnote">
        {portfolioAvailable
          ? 'Portfolio state loaded from the Neptlium API. Unavailable fields remain undisclosed.'
          : 'Portfolio state could not be loaded. No balance, position, performance or income value has been inferred.'}
      </p>
    </div>
  );
}

export function AllocationExperience() {
  const { snapshot } = useProductBootstrap();
  const allocation = snapshot.allocation.state === 'READY' ? snapshot.allocation.data : undefined;
  const steps = [
    allocation?.modeled,
    allocation?.authorized,
    allocation?.authorized,
    allocation?.executed,
    allocation?.executed,
    allocation?.reconciled,
  ];
  const labels = ['MODEL', 'REVIEW', 'APPROVE', 'RESERVE', 'EXECUTE', 'RECONCILE'];
  const current =
    allocation?.reconciled.state === 'VALUE'
      ? 'Reconciled'
      : allocation?.executed.state === 'VALUE'
        ? 'Executing'
        : allocation?.authorized.state === 'VALUE'
          ? 'Approved'
          : allocation?.modeled.state === 'VALUE'
            ? 'Proposed'
            : allocation
              ? 'Not configured'
              : 'Unavailable';
  const badge: ProductStateName =
    current === 'Reconciled'
      ? 'RECONCILED'
      : current === 'Executing'
        ? 'PENDING'
        : current === 'Approved'
          ? 'REQUIRES_APPROVAL'
          : current === 'Proposed'
            ? 'PENDING'
            : current === 'Unavailable'
              ? 'UNAVAILABLE'
              : 'NOT_CONFIGURED';
  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Allocation"
        title="Allocation"
        description="Capital decisions remain separate from approval, reservation, execution and reconciliation."
      />
      <section className="op-state-hero">
        <span>Current state</span>
        <strong>{current}</strong>
        <ProductStateBadge state={badge} />
      </section>
      <section className="op-panel">
        <SectionHeading label="Lifecycle" title="Governed progression" />
        <div className="op-lifecycle">
          {labels.map((label, index) => {
            const complete = steps[index]?.state === 'VALUE';
            return (
              <div className={complete ? 'is-complete' : ''} key={label}>
                <i>{complete ? <Check size={13} /> : index + 1}</i>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="op-grid-2">
        <article className="op-panel">
          <SectionHeading label="Current" title="Observed portfolio" />
          <EmptyCanvas
            title="Observed allocation unavailable"
            detail="Current weights are not inferred without canonical positions and valuation."
          />
        </article>
        <article className="op-panel">
          <SectionHeading label="Target" title="Authorized allocation" />
          <EmptyCanvas
            title={
              current === 'Not configured'
                ? 'No allocation configured'
                : 'Target projection unavailable'
            }
            detail="Target weights appear only when the governed allocation model exposes an authoritative typed projection."
          />
        </article>
      </section>
      <section className="op-panel">
        <SectionHeading label="Decision record" title="Authority boundaries" />
        <div className="op-governance-grid">
          <div>
            <Layers3 size={17} />
            <strong>Model</strong>
            <p>Defines a proposed capital arrangement.</p>
          </div>
          <div>
            <ShieldCheck size={17} />
            <strong>Approval</strong>
            <p>Records explicit authority separately from modeling.</p>
          </div>
          <div>
            <Wallet size={17} />
            <strong>Reservation</strong>
            <p>Prevents capital from being promised twice.</p>
          </div>
          <div>
            <Landmark size={17} />
            <strong>Reconciliation</strong>
            <p>Certifies executed state against evidence.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ActivityExperience() {
  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Activity"
        title="Account activity"
        description="A chronological record of governed capital events and state changes."
      />
      <section className="op-panel">
        <SectionHeading label="Account activity" title="Recent activity" />
        <ActivityRows />
      </section>
    </div>
  );
}

export function InvestExperience() {
  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Invest"
        title="Discover investments"
        description="Evaluate opportunities supported by your account without mistaking research coverage for investable inventory."
        actions={
          <Link className="op-button" href="/dashboard/portfolio">
            View portfolio <ArrowRight size={14} />
          </Link>
        }
      />
      <section className="op-panel op-chart-panel">
        <SectionHeading label="Opportunities" title="No investments are currently available" />
        <EmptyCanvas
          title="Investment discovery is not available yet"
          detail="Opportunities will appear here only when their terms, documents, risks and account eligibility are available. Neptlium does not present planned categories as current inventory."
        />
      </section>
      <section className="op-panel">
        <SectionHeading label="Product standard" title="What every opportunity must establish" />
        <div className="op-readiness-grid">
          {[
            ['Strategy', 'What the investment is designed to do.'],
            ['Terms', 'Minimums, duration, liquidity and fees.'],
            ['Documents', 'The records required to evaluate the product.'],
            ['Risks', 'Material risks presented before any allocation action.'],
            ['Eligibility', 'Whether this account may access the opportunity.'],
          ].map(([title, detail]) => (
            <div key={title}>
              <ShieldCheck size={16} aria-hidden="true" />
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="op-grid-2">
        <article className="op-panel">
          <SectionHeading label="Intelligence" title="Research before you act" />
          <p className="text-sm leading-6 text-text-secondary">
            Company intelligence is research context, not an offer, recommendation or portfolio
            position.
          </p>
          <Link className="op-inline-link" href="/dashboard/companies">
            Explore company research <ArrowRight size={14} />
          </Link>
        </article>
        <article className="op-panel">
          <SectionHeading label="Capital" title="Available to invest" />
          <p className="text-sm leading-6 text-text-secondary">
            Review your capital and the funding routes currently available to your account.
          </p>
          <Link className="op-inline-link" href="/dashboard/capital">
            Review capital <ArrowRight size={14} />
          </Link>
        </article>
      </section>
    </div>
  );
}

export function MoreExperience() {
  const items = [
    ['/dashboard/capital', 'Capital actions', 'Deposit, transfer and withdraw', Wallet],
    [
      '/dashboard/allocation',
      'Allocation',
      'How your investments are distributed',
      SlidersHorizontal,
    ],
    ['/dashboard/companies', 'Companies', 'Investment research and context', Layers3],
    ['/dashboard/documents', 'Documents', 'Statements and account files', FileText],
    ['/dashboard/notifications', 'Notifications', 'Account and lifecycle notices', Bell],
    ['/dashboard/settings', 'Settings', 'Profile, verification and security', ShieldCheck],
  ] as const;
  return (
    <div className="op-stack">
      <PageHeader
        eyebrow="Account"
        title="More"
        description="Capital actions, documents, notifications and account settings."
      />
      <section className="op-more-grid">
        {items.map(([href, title, detail, Icon]) => (
          <Link key={href} href={href}>
            <Icon size={18} />
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
            <ArrowRight size={15} />
          </Link>
        ))}
      </section>
    </div>
  );
}
