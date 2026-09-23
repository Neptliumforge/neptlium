import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Intelligence',
  description: 'Decision-support intelligence for capital, portfolios, transactions and operating evidence without replacing financial authority.',
  path: '/intelligence',
});

const capabilities = [
  ['Observation', 'Surface transaction, portfolio and operating evidence without treating observations as canonical financial truth.'],
  ['Analysis', 'Organize context, uncertainty and material signals so people can understand what changed and why it matters.'],
  ['Recommendation', 'Present decision support with evidence and limits while leaving authorization and execution under governed human control.'],
] as const;

export default function IntelligencePage() {
  return <div className="family-page" data-route-canvas="intelligence">
    <div className="family-shell">
      <section className="family-hero" aria-labelledby="intelligence-title">
        <div><p className="family-label">Neptlium Intelligence</p><h1 className="np-hero" id="intelligence-title">Intelligence for every capital decision.</h1></div>
        <div className="family-hero-copy"><p>Neptlium Intelligence connects evidence, context and governed recommendations while keeping observation, analysis, authorization and canonical financial state explicitly separate.</p><div className="family-actions"><Link className="family-action family-action-primary" href="/capital">Explore Capital</Link><Link className="family-action" href="/security">How authority works</Link></div></div>
      </section>
      <section className="family-grid" aria-label="Intelligence architecture">{capabilities.map(([label,copy]) => <article className="family-card" key={label}><span>Decision-support layer</span><h2>{label}</h2><p>{copy}</p></article>)}</section>
      <p className="family-note">Transaction intelligence is observational and non-canonical. Recommendations do not authorize movement, post the ledger, establish settlement or replace reconciliation.</p>
    </div>
  </div>;
}
