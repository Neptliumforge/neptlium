import Link from 'next/link';
import { ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react';

const capabilities = ['Business financial workspace', 'Payments and transfers', 'Stablecoin operations', 'Team access', 'Approval controls', 'Treasury visibility'] as const;

export default function TreasuryUpgradePage() {
  return <div className="op-stack">
    <header className="op-page-header"><div><p className="op-eyebrow">Neptlium Treasury</p><h1>Build a separate business financial workspace.</h1><p>Your personal Capital account remains separate. Treasury begins with an organization and its own governed operating context.</p></div><Link className="op-button" href="/dashboard/settings"><ArrowLeft size={15}/>Settings</Link></header>
    <section className="op-grid-2">
      <article className="op-panel"><div className="op-state-focus"><Building2 size={20}/><div><strong>Treasury Core</strong><p>Recommended starting workspace for businesses that need payments, liquidity visibility and controlled financial operations.</p></div></div><div className="mt-5"><strong className="op-value-compact">$49 / month</strong><p className="op-footnote">Proposed launch pricing. Provider, network, payment and FX charges remain separately disclosed where applicable.</p></div><div className="op-row-list mt-5">{capabilities.map((item) => <div className="op-data-row" key={item}><span><strong>{item}</strong></span><Check size={16}/></div>)}</div></article>
      <article className="op-panel"><div className="op-section-heading"><div><span>Boundary</span><h2>One identity. Separate ownership contexts.</h2></div></div><p className="text-sm leading-6 text-text-secondary">Treasury onboarding creates or joins an organization. It does not convert your personal investor account into a business account and does not merge personal capital with organization funds.</p><div className="mt-6"><a className="op-button op-button-primary" href="https://treasury.neptlium.com/onboarding">Start Treasury setup <ArrowRight size={15}/></a></div></article>
    </section>
  </div>;
}
