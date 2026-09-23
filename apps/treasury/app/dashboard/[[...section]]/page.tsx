import Link from 'next/link';
import { CapitalRails, NeptliumMark } from '@neptlium/ui';
import { SignOutButton } from '@/app/auth/sign-out-button';

const navigation = [
  ['Overview', '/dashboard', 'overview'],
  ['Treasury', '/dashboard/treasury', 'treasury'],
  ['Investments', '/dashboard/investments', 'investments'],
  ['Allocations', '/dashboard/allocations', 'allocations'],
  ['Operations', '/dashboard/operations', 'operations'],
  ['Authority', '/dashboard/authority', 'authority'],
  ['Records', '/dashboard/records', 'records'],
] as const;

const operatingMetrics = [
  ['Capital', 'Canonical Treasury projection unavailable'],
  ['Available liquidity', 'No reconciled liquidity projection'],
  ['Committed capital', 'No organization commitment record'],
  ['Pending settlement', 'No settlement evidence projection'],
] as const;

const treasuryActions = [
  ['Fund', 'Bring capital into an organization account through an eligible rail.'],
  ['Move', 'Create a governed movement intent between approved endpoints.'],
  ['Allocate', 'Direct available capital within an authorized mandate.'],
  ['Settle', 'Track external completion separately from internal authorization.'],
  ['Reconcile', 'Match provider evidence to Neptlium records.'],
  ['Govern', 'Apply roles, policies, approvals and operating limits.'],
] as const;

const authorityLayers = [
  [
    'Organizations',
    'Ownership context',
    'Organization identity exists in production; Treasury-scoped ownership resolution is not yet exposed here.',
  ],
  [
    'Members',
    'Human access',
    'Treasury membership records and organization-scoped access resolution are not yet available.',
  ],
  [
    'Roles',
    'Operating responsibility',
    'A personal platform role does not grant an organization Treasury role.',
  ],
  [
    'Permissions',
    'Allowed actions',
    'No browser-visible permission is treated as execution authority.',
  ],
  [
    'Approval policies',
    'Decision rules',
    'Withdrawal policy groundwork exists server-side; a complete organization policy projection does not.',
  ],
  [
    'Mandates',
    'Capital constraints',
    'Durable Treasury mandates and enforcement evidence are not yet implemented.',
  ],
  [
    'Agents',
    'Delegated operation',
    'No agent has independent authority or an active execution path.',
  ],
] as const;

const authorityFlow = [
  ['Mandate', 'Defines permitted scope and constraints.'],
  ['Authority check', 'Resolves the actor, role, policy and required approvals.'],
  ['Decision', 'Denied, approval required, or authorized.'],
  ['Execution', 'May begin only through a separately enabled server capability.'],
  ['Reconciliation', 'Compares external evidence with canonical state.'],
  ['Record', 'Preserves the decision, movement and supporting evidence.'],
] as const;

const routeCopy: Record<string, [string, string, string]> = {
  treasury: [
    'Treasury',
    'Operate capital with control.',
    'Fund, move, allocate, settle, reconcile and govern organization capital without collapsing approval, execution and evidence into one state.',
  ],
  investments: [
    'Investments',
    'Put institutional capital to work.',
    'Organization investment inventory and position evidence will appear only when supported by authoritative product and portfolio projections.',
  ],
  allocations: [
    'Allocations',
    'Direct capital within mandate.',
    'Modeled, reviewed, approved, reserved, executed and reconciled allocation states remain distinct.',
  ],
  operations: [
    'Operations',
    'See what requires action.',
    'Payment intents, approvals, settlements and reconciliation exceptions require organization-scoped operational projections before they can appear here.',
  ],
  authority: [
    'Authority',
    'Define who may do what.',
    'Authority belongs to the organization and its policies. Authentication identifies a person; it does not grant permission to move capital.',
  ],
  records: [
    'Records',
    'Evidence for every movement.',
    'Authoritative activity, approvals, settlements, reconciliation and audit records will appear with their source and status when available.',
  ],
};

function Brand() {
  return (
    <Link className="treasury-brand" href="/dashboard" aria-label="Neptlium Treasury home">
      <NeptliumMark size={28} tone="teal" />
      <span>
        <strong>NEPTLIUM</strong>
        <small>Treasury</small>
      </span>
    </Link>
  );
}

function Navigation({ active }: { readonly active: string }) {
  return (
    <>
      {navigation.map(([label, href, key]) => (
        <Link key={href} href={href} aria-current={active === key ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </>
  );
}

function Sidebar({ active }: { readonly active: string }) {
  return (
    <aside className="treasury-sidebar">
      <Brand />
      <p className="treasury-nav-label">Institutional</p>
      <nav className="treasury-navigation" aria-label="Institutional navigation">
        <Navigation active={active} />
      </nav>
      <div className="treasury-sidebar-note">
        <span>Operating state</span>
        <strong>Authority unavailable</strong>
        <p>No organization-scoped authority projection is active.</p>
      </div>
    </aside>
  );
}

function MobileNav({ active }: { readonly active: string }) {
  const mobile = navigation.filter(([, , key]) =>
    ['overview', 'treasury', 'operations', 'authority'].includes(key),
  );
  return (
    <nav className="treasury-mobile" aria-label="Institutional mobile navigation">
      {mobile.map(([label, href, key]) => (
        <Link key={href} href={href} aria-current={active === key ? 'page' : undefined}>
          {label}
        </Link>
      ))}
      <Link
        href="/dashboard/records"
        aria-current={
          active === 'records' || active === 'investments' || active === 'allocations'
            ? 'page'
            : undefined
        }
      >
        More
      </Link>
    </nav>
  );
}

function EmptyState({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="treasury-empty">
      <span className="treasury-state-tag">Unavailable</span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function Overview() {
  return (
    <>
      <div className="treasury-page-heading">
        <div>
          <p className="treasury-eyebrow">Institutional overview</p>
          <h1>Capital operations, clearly governed.</h1>
        </div>
        <p>
          See organization capital, liquidity, obligations, approvals and evidence in one operating
          view. Values remain unavailable until Neptlium can establish them from authoritative
          organization records.
        </p>
      </div>
      <div className="treasury-rails-context">
        <CapitalRails
          variant="treasury"
          nodes={[
            { label: 'Capital', state: 'neutral' },
            { label: 'Authority', state: 'restricted' },
            { label: 'Evidence', state: 'neutral' },
            { label: 'Reconciliation', state: 'neutral' },
          ]}
          active={false}
          label="Treasury capital rails — organization authority is not established"
        />
      </div>
      <div className="treasury-grid">
        {operatingMetrics.map(([label, detail]) => (
          <article className="treasury-panel treasury-metric" key={label}>
            <span>{label}</span>
            <strong>—</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <div className="treasury-operating-grid">
        <section className="treasury-panel">
          <div className="treasury-section-heading">
            <div>
              <p className="treasury-kicker">Attention</p>
              <h2>Operating priorities</h2>
            </div>
            <span className="treasury-count">—</span>
          </div>
          <EmptyState title="No authoritative attention queue">
            Approval requests, pending settlements and reconciliation exceptions cannot be inferred
            from empty or provider-only data.
          </EmptyState>
        </section>
        <section className="treasury-panel">
          <div className="treasury-section-heading">
            <div>
              <p className="treasury-kicker">Readiness</p>
              <h2>Organization context</h2>
            </div>
          </div>
          <div className="treasury-readiness">
            <div>
              <span>Identity</span>
              <strong>Authenticated</strong>
            </div>
            <div>
              <span>Organization authority</span>
              <strong>Unavailable</strong>
            </div>
            <div>
              <span>Execution capability</span>
              <strong>Disabled</strong>
            </div>
          </div>
          <Link className="treasury-text-link" href="/onboarding">
            Review organization setup →
          </Link>
        </section>
      </div>
      <section className="treasury-panel treasury-section">
        <div className="treasury-section-heading">
          <div>
            <p className="treasury-kicker">Activity</p>
            <h2>Recent capital movements</h2>
          </div>
          <Link className="treasury-text-link" href="/dashboard/records">
            View records
          </Link>
        </div>
        <EmptyState title="No canonical movement records">
          A provider observation alone will not appear as an authorized, settled or reconciled
          movement.
        </EmptyState>
      </section>
    </>
  );
}

function Treasury() {
  return (
    <>
      <PageHeading page="treasury" />
      <div className="treasury-action-grid">
        {treasuryActions.map(([title, copy]) => (
          <article key={title}>
            <span>{title}</span>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <section className="treasury-panel treasury-section">
        <div className="treasury-section-heading">
          <div>
            <p className="treasury-kicker">Liquidity</p>
            <h2>Treasury position</h2>
          </div>
          <span className="treasury-state-tag">Unavailable</span>
        </div>
        <div className="treasury-position-grid">
          {['Available', 'Reserved', 'Committed', 'Pending', 'Restricted'].map((label) => (
            <div key={label}>
              <span>{label}</span>
              <strong>—</strong>
            </div>
          ))}
        </div>
        <p className="treasury-disclosure">
          No canonical organization liquidity projection is available. Unknown state is never
          represented as zero.
        </p>
      </section>
    </>
  );
}

function Authority() {
  return (
    <>
      <PageHeading page="authority" />
      <section className="treasury-authority-grid" aria-label="Authority layers">
        {authorityLayers.map(([title, label, copy]) => (
          <article key={title}>
            <div>
              <span>{label}</span>
              <h2>{title}</h2>
            </div>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="treasury-panel treasury-section">
        <div className="treasury-section-heading">
          <div>
            <p className="treasury-kicker">Control path</p>
            <h2>Authority before execution</h2>
          </div>
          <span className="treasury-state-tag">No active execution</span>
        </div>
        <ol className="treasury-authority-flow">
          {authorityFlow.map(([title, copy], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="treasury-principle">
          <strong>AI does not create authority.</strong>
          <p>
            Any future agent capability must remain inside a durable mandate, pass the same
            authority checks as a human action and produce reconciliation evidence and a record.
          </p>
        </div>
      </section>
    </>
  );
}

function PageHeading({ page }: { readonly page: string }) {
  const [title, headline, copy] = routeCopy[page] ?? [
    'Workspace',
    'Institutional capital, in context.',
    'This capability is not configured.',
  ];
  return (
    <div className="treasury-page-heading">
      <div>
        <p className="treasury-eyebrow">{title}</p>
        <h1>{headline}</h1>
      </div>
      <p>{copy}</p>
    </div>
  );
}

function StandardPage({ page }: { readonly page: string }) {
  const descriptions: Record<string, [string, string]> = {
    investments: [
      'No institutional investment projection',
      'No organization investment inventory, eligible opportunity set or reconciled position data is available.',
    ],
    allocations: [
      'No governed allocation plans',
      'Allocation groundwork exists, but no organization-scoped mandate, reservation or execution capability is active.',
    ],
    operations: [
      'No authoritative operations queue',
      'Approvals, pending settlements and reconciliation exceptions will appear only from governed organization records.',
    ],
    records: [
      'No organization records available',
      'Activity is not fabricated from authentication events, provider observations or empty operational tables.',
    ],
  };
  const [title, copy] = descriptions[page] ?? [
    'Capability unavailable',
    'No authoritative organization projection is available.',
  ];
  return (
    <>
      <PageHeading page={page} />
      <section className="treasury-panel treasury-section">
        <EmptyState title={title}>{copy}</EmptyState>
      </section>
    </>
  );
}

export default async function TreasuryDashboard({
  params,
}: {
  readonly params: Promise<{ section?: string[] }>;
}) {
  const { section = [] } = await params;
  const requested = section[0] ?? 'overview';
  const active = navigation.some(([, , key]) => key === requested) ? requested : 'overview';
  return (
    <div className="treasury-shell">
      <Sidebar active={active} />
      <main className="treasury-main">
        <header className="treasury-topbar">
          <div>
            <span className="treasury-live-dot" aria-hidden="true" />
            Institutional workspace
          </div>
          <div className="treasury-topbar-actions">
            <small>Organization authority unavailable</small>
            <SignOutButton />
          </div>
        </header>
        <div className="treasury-content">
          {active === 'overview' ? (
            <Overview />
          ) : active === 'treasury' ? (
            <Treasury />
          ) : active === 'authority' ? (
            <Authority />
          ) : (
            <StandardPage page={active} />
          )}
        </div>
      </main>
      <MobileNav active={active} />
    </div>
  );
}
