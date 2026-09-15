import Link from 'next/link';
import { SignOutButton } from '@/app/auth/sign-out-button';

const groups = [
  ['COMMAND CENTER', [['Overview', '/dashboard']]],
  ['MONEY', [['Treasury', '/dashboard/treasury'], ['Payments', '/dashboard/payments'], ['Receivables', '/dashboard/receivables']]],
  ['OPERATIONS', [['Counterparties', '/dashboard/counterparties'], ['Approvals', '/dashboard/approvals']]],
  ['CONTROL', [['Policies', '/dashboard/policies'], ['Risk', '/dashboard/risk'], ['Wallets', '/dashboard/wallets']]],
  ['INTELLIGENCE', [['Reports', '/dashboard/reports'], ['Activity', '/dashboard/activity']]],
  ['SYSTEM', [['Integrations', '/dashboard/integrations'], ['Audit Log', '/dashboard/audit'], ['Settings', '/dashboard/settings']]],
] as const;

const paymentLifecycle = ['DRAFT','PREFLIGHT','POLICY_CHECKED','AWAITING_APPROVAL','AUTHORIZED','RESERVED','AWAITING_SIGNATURE','SIGNED','SUBMITTED','CONFIRMING','SETTLED','RECONCILED'];

const routeCopy: Record<string, [string,string]> = {
  treasury: ['Treasury', 'Authoritative treasury state will appear here only after organization-scoped canonical projections are available.'],
  payments: ['Payments', 'Governed payment intent lifecycle. Execution remains unavailable until server-side policy, approval, reservation, provider submission, settlement and reconciliation authority are complete.'],
  receivables: ['Receivables', 'Invoice and receivable state will appear when an organization-scoped receivables projection exists.'],
  counterparties: ['Counterparties', 'Counterparty identity and eligibility are not inferred by the browser.'],
  approvals: ['Approvals', 'Approval presentation is separate from execution authority. No client-side approval state grants permission to move assets.'],
  policies: ['Policies', 'Deterministic policy state will appear only when the server exposes authoritative organization policy configuration.'],
  risk: ['Risk', 'Risk presents evidence and review reasons, not invented scores or AI authority.'],
  wallets: ['Wallets', 'Wallets are execution infrastructure beneath treasury accounts, not the application identity or top-level ownership model.'],
  reports: ['Reports', 'Governed treasury reporting will appear when canonical reporting projections are available.'],
  activity: ['Activity', 'Append-only organization activity will appear here when the audit/activity projection is available.'],
  integrations: ['Integrations', 'Provider and accounting integrations remain capability-gated and server-authorized.'],
  audit: ['Audit Log', 'Actor, action, entity, request, timestamp and context belong to an append-only audit projection.'],
  settings: ['Settings', 'Organization settings require explicit server-side organization membership and authorization contracts.'],
};

function Sidebar() {
  return <aside className="treasury-sidebar"><div className="treasury-brand"><strong>NEPTLIUM</strong><span>Treasury</span></div>{groups.map(([group,items]) => <nav className="treasury-nav-group" key={group}><span>{group}</span>{items.map(([label,href]) => <Link key={href} href={href}>{label}</Link>)}</nav>)}</aside>;
}

function MobileNav() {
  return <nav className="treasury-mobile" aria-label="Neptlium Treasury mobile navigation"><Link href="/dashboard">Home</Link><Link href="/dashboard/treasury">Treasury</Link><Link href="/dashboard/payments">Payments</Link><Link href="/dashboard/approvals">Approvals</Link><Link href="/dashboard/settings">More</Link></nav>;
}

function Overview() {
  return <>
    <p className="treasury-eyebrow">Command center</p><h1 className="treasury-title">Good morning.</h1><p className="treasury-copy">Neptlium Treasury separates organization identity, policy, approval, execution evidence and reconciliation. No authenticated browser session alone grants treasury authority.</p>
    <section className="treasury-panel treasury-section"><h2>Organization readiness</h2><div className="treasury-empty"><strong>Set up your Treasury operating context.</strong><span>Establish organization, team, connection and policy boundaries before governed financial capabilities are activated.</span><Link href="/onboarding">Open organization setup →</Link></div></section>
    <div className="treasury-grid">
      {['Treasury value','Available','Reserved','In transit'].map((label) => <article className="treasury-panel treasury-metric" key={label}><span>{label}</span><strong>—</strong><small className="treasury-state">Canonical treasury projection unavailable</small></article>)}
    </div>
    <section className="treasury-panel treasury-section"><h2>Requires attention</h2><div className="treasury-empty"><strong>No actionable treasury events.</strong><span>Attention items appear only from organization-scoped policy, approval, settlement or reconciliation evidence.</span></div></section>
    <section className="treasury-panel treasury-section"><h2>Recent activity</h2><div className="treasury-empty"><strong>No treasury activity yet.</strong><span>Nothing is fabricated from provider or wallet state.</span></div></section>
  </>;
}

export default async function TreasuryDashboard({ params }: { readonly params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  const key = section[0] ?? 'overview';
  const copy = routeCopy[key];
  return <div className="treasury-shell"><Sidebar/><main className="treasury-main"><header className="treasury-topbar"><span>{copy?.[0] ?? 'Overview'}</span><div className="treasury-topbar-actions"><small>Organization authority unavailable</small><SignOutButton /></div></header><div className="treasury-content">{key === 'overview' ? <Overview/> : <><p className="treasury-eyebrow">Neptlium Treasury</p><h1 className="treasury-title">{copy?.[0] ?? 'Workspace'}</h1><p className="treasury-copy">{copy?.[1] ?? 'This capability is not configured.'}</p>{key === 'payments' ? <section className="treasury-panel treasury-section"><h2>Governed payment lifecycle</h2><div className="treasury-lifecycle">{paymentLifecycle.map((state) => <span key={state}>{state.replaceAll('_',' ')}</span>)}</div><div className="treasury-empty"><strong>Payment execution unavailable</strong><span>No browser → Circle, browser → Alchemy, or browser → canonical payment mutation path is present in this foundation.</span></div></section> : <section className="treasury-panel treasury-section"><h2>Capability unavailable</h2><div className="treasury-empty"><strong>No authoritative organization projection is available.</strong><span>This shell is intentionally inert until server-side organization membership, role, permission and capability contracts exist.</span></div></section>}</>}</div></main><MobileNav/></div>;
}
