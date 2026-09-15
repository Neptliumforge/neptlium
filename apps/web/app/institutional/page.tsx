import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Institutional',
  description: 'The developing Neptlium environment for funds, family offices, asset managers and complex capital organizations.',
  path: '/institutional',
});

const capabilities = [
  ['Organizations', 'Multi-entity financial context and explicit ownership boundaries.'],
  ['Mandates', 'Policy, portfolio and operating authority designed for professional capital.'],
  ['Reporting', 'Governed records, reconciliation and institutional reporting context.'],
] as const;

export default function InstitutionalPage() {
  return <div className="family-page" data-npt-surface="ivory">
    <div className="family-shell">
      <section className="family-hero" aria-labelledby="institutional-title">
        <div><p className="family-label">Institutional · Developing</p><h1 className="np-hero" id="institutional-title">Capital systems for complex organizations.</h1></div>
        <div className="family-hero-copy"><p>Neptlium Institutional is being designed for funds, family offices and asset managers that need organizational context, mandates, portfolios, treasury, controls and reporting to remain connected.</p><div className="family-actions"><Link className="family-action family-action-primary" href="/contact">Talk to Neptlium</Link><Link className="family-action" href="/platform">Explore the platform</Link></div></div>
      </section>
      <section className="family-grid" aria-label="Institutional architecture">{capabilities.map(([label,copy]) => <article className="family-card" key={label}><span>Planned capability</span><h2>{label}</h2><p>{copy}</p></article>)}</section>
      <p className="family-note">Institutional capabilities shown here describe the intended product direction and are not represented as currently available execution, custody, brokerage or regulated investment services.</p>
    </div>
  </div>;
}
