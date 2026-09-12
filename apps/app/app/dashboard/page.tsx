import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { requireProvisionedUser } from '@/lib/auth';
import { getOverviewState, type CustomerActivity, type ResourceState } from '@/lib/api/client';

function stateLabel(resource: ResourceState<unknown> | null | undefined) {
  if (!resource) return 'Temporarily unavailable';
  switch (resource.state) {
    case 'VALUE':
      return 'Available';
    case 'EMPTY':
      return 'No data yet';
    case 'PENDING':
      return 'Pending';
    case 'NOT_CONFIGURED':
      return 'Not configured';
    case 'UNAVAILABLE':
      return 'Unavailable';
  }
}

function stateClass(resource: ResourceState<unknown> | null | undefined) {
  if (!resource) return 'is-muted';
  if (resource.state === 'VALUE') return 'is-positive';
  if (resource.state === 'PENDING') return 'is-pending';
  return 'is-muted';
}

function activityTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function ActivityRow({ item }: { readonly item: CustomerActivity }) {
  return (
    <div className="investor-activity-row">
      <div>
        <span>{item.type}</span>
        <strong>{item.status}</strong>
        <p>
          {item.amount ? `${item.amount} ${item.asset}` : item.asset}
          {item.network ? ` · ${item.network}` : ''}
        </p>
      </div>
      <time dateTime={item.createdAt}>
        <Clock3 size={13} aria-hidden="true" />
        {activityTimestamp(item.createdAt)}
      </time>
    </div>
  );
}

export default async function DashboardPage() {
  const { profile } = await requireProvisionedUser();
  const firstName = (profile.fullName ?? profile.displayName ?? 'there').split(' ')[0];
  const overview = await getOverviewState().catch(() => null);
  const activity = overview?.activity.state === 'VALUE' ? overview.activity.value : [];

  return (
    <div className="investor-dashboard">
      <section className="investor-dashboard-intro">
        <div>
          <p className="investor-eyebrow">Overview</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>Your capital view reflects only states Neptlium can currently support with system evidence.</p>
        </div>
        <div className="investor-intro-actions">
          <Link className="investor-primary-action" href="/dashboard/deposit">
            <ArrowDownToLine size={16} aria-hidden="true" /> Deposit
          </Link>
          <Link className="investor-secondary-action" href="/dashboard/portfolio">
            Portfolio <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="investor-balance-panel" aria-labelledby="portfolio-value-heading">
        <div className="investor-balance-copy">
          <span id="portfolio-value-heading">Portfolio value</span>
          <strong>—</strong>
          <p>
            Canonical portfolio valuation is not presented until reconciled holdings and reporting
            history are available.
          </p>
        </div>
        <div className="investor-balance-status" role="list" aria-label="Capital status">
          {[
            ['Available capital', overview?.capital.available],
            ['Reserved capital', overview?.capital.reserved],
            ['Allocated capital', overview?.capital.allocated],
          ].map(([label, resource]) => (
            <div key={label as string} role="listitem">
              <span>{label as string}</span>
              <strong>—</strong>
              <em className={stateClass(resource as ResourceState<unknown> | undefined)}>
                {stateLabel(resource as ResourceState<unknown> | undefined)}
              </em>
            </div>
          ))}
        </div>
      </section>

      <section className="investor-dashboard-grid" aria-label="Account state">
        <article className="investor-state-card">
          <div className="investor-state-icon"><BriefcaseBusiness size={18} aria-hidden="true" /></div>
          <div>
            <span>Portfolio</span>
            <h2>Holdings & performance</h2>
            <p>Positions, valuation and reporting appear here only when canonical portfolio data is available.</p>
          </div>
          <div className="investor-state-footer">
            <span className={stateClass(overview?.portfolio)}>{stateLabel(overview?.portfolio)}</span>
            <Link href="/dashboard/portfolio">Open portfolio <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </article>

        <article className="investor-state-card">
          <div className="investor-state-icon"><Landmark size={18} aria-hidden="true" /></div>
          <div>
            <span>Treasury</span>
            <h2>Liquidity & readiness</h2>
            <p>Available, reserved and operational liquidity remain distinct from provider-reported balances.</p>
          </div>
          <div className="investor-state-footer">
            <span className={stateClass(overview?.treasury)}>{stateLabel(overview?.treasury)}</span>
            <Link href="/dashboard/treasury">Open treasury <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </article>

        <article className="investor-state-card">
          <div className="investor-state-icon"><ShieldCheck size={18} aria-hidden="true" /></div>
          <div>
            <span>Allocation</span>
            <h2>Governed decisions</h2>
            <p>Modeling, approval, reservation and execution are treated as separate financial states.</p>
          </div>
          <div className="investor-state-footer">
            <span className={stateClass(overview?.allocation)}>{stateLabel(overview?.allocation)}</span>
            <Link href="/dashboard/allocations">Review allocation <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </article>
      </section>

      <section className="investor-activity-panel" aria-labelledby="recent-activity-heading">
        <div className="investor-section-heading">
          <div>
            <span>Activity</span>
            <h2 id="recent-activity-heading">Recent account events</h2>
          </div>
          <Link href="/dashboard/transactions">View all <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>

        {activity.length ? (
          <div className="investor-activity-list">
            {activity.map((item) => <ActivityRow key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="investor-empty-state">
            <strong>No account activity yet.</strong>
            <p>Funding, transaction and portfolio events will appear here after they are recorded by Neptlium.</p>
          </div>
        )}
      </section>
    </div>
  );
}
