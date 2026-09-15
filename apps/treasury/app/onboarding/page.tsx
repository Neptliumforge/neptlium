import Link from 'next/link';

const stages = [
  ['01', 'Organization', 'Create the legal organization context that owns Treasury accounts and policies.'],
  ['02', 'Business purpose', 'Describe treasury use cases, expected activity, assets, networks and operating regions.'],
  ['03', 'Ownership & control', 'Keep legal ownership, directors and control persons distinct from product permissions.'],
  ['04', 'Treasury connections', 'Connect supported wallets and financial accounts without transferring custody to Neptlium.'],
  ['05', 'Team', 'Invite owners, admins, operators, approvers, viewers and auditors with explicit roles.'],
  ['06', 'Policies', 'Configure approval thresholds, destination controls and supported asset/network boundaries.'],
  ['07', 'Counterparties', 'Establish verified operational destinations rather than repeatedly pasting addresses.'],
  ['08', 'Review & activate', 'Review readiness before any governed financial capability can become active.'],
] as const;

export default function TreasuryOnboardingPage() {
  return <main className="treasury-onboarding">
    <div className="treasury-onboarding-shell">
      <header className="treasury-onboarding-header"><div className="treasury-onboarding-brand"><strong>NEPTLIUM</strong><span>Treasury</span></div><span className="treasury-onboarding-status">Organization setup · authority remains server-controlled</span></header>
      <section className="treasury-onboarding-hero" aria-labelledby="treasury-onboarding-title">
        <div><p className="np-label" style={{ marginBottom: '16px', color: '#7f8985' }}>Treasury onboarding</p><h1 className="np-h1" id="treasury-onboarding-title">Set up the organization before money moves.</h1></div>
        <p>Neptlium Treasury separates human identity, legal organization ownership, operating roles, approval authority and financial execution. This setup environment establishes those boundaries progressively.</p>
      </section>
      <section className="treasury-onboarding-grid" aria-label="Treasury onboarding stages">{stages.map(([number,title,copy], index) => <article className="treasury-onboarding-step" key={title}><div className="treasury-onboarding-step-head"><span>{number}</span><em>{index === 0 ? 'Foundation' : 'Configured as capability becomes available'}</em></div><h2>{title}</h2><p>{copy}</p></article>)}</section>
      <aside className="treasury-onboarding-note"><p>This shell intentionally does not create payment, custody, settlement or approval authority in the browser. Organization setup becomes actionable only when the Platform Core owner/membership contracts and corresponding persistence are available.</p><Link className="treasury-onboarding-action" href="/dashboard">Continue to Treasury</Link></aside>
    </div>
  </main>;
}
