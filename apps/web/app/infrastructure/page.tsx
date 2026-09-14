import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Infrastructure',
  description: 'Pay, API and developer infrastructure for building with Neptlium.',
  path: '/infrastructure',
});

const capabilities = [
  ['Pay', 'Public payment experiences designed to remain minimally privileged.'],
  ['API', 'The shared server boundary for Neptlium product and financial systems.'],
  ['Docs', 'Developer contracts, integration guidance and capability status.'],
] as const;

export default function InfrastructurePage() {
  return <div className="family-page" data-npt-surface="ivory">
    <div className="family-shell">
      <section className="family-hero" aria-labelledby="infrastructure-title">
        <div><p className="family-label">Infrastructure</p><h1 className="np-hero" id="infrastructure-title">Build on Neptlium.</h1></div>
        <div className="family-hero-copy"><p>Neptlium Infrastructure brings payment surfaces, APIs and developer documentation into one technical environment without moving financial authority into public clients.</p><div className="family-actions"><a className="family-action family-action-primary" href="https://docs.neptlium.com">Open documentation</a><a className="family-action" href="https://status.neptlium.com">View system status</a></div></div>
      </section>
      <section className="family-grid" aria-label="Infrastructure products">{capabilities.map(([label,copy]) => <article className="family-card" key={label}><span>Infrastructure</span><h2>{label}</h2><p>{copy}</p></article>)}</section>
      <p className="family-note">Infrastructure documentation distinguishes live, beta and planned capabilities. A public product surface never implies custody, settlement authority or unrestricted financial execution.</p>
    </div>
  </div>;
}
