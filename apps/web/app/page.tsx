import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital, understood before it moves',
  description: 'Neptlium is the intelligence layer for modern capital — helping institutions understand position, change, and strategic attention.',
  path: '/',
});

const capabilities = [
  ['Ownership Intelligence', 'Understand holdings, exposure, concentration, and strategic position.'],
  ['Market Intelligence', 'Read market movement, opportunities, and changing conditions in context.'],
  ['Decision Intelligence', 'Move from data to context to decision without losing the thread.'],
  ['Capital Operations', 'Support oversight, allocation, reporting, and planning in one environment.'],
] as const;
const ecosystem = [
  ['Markets', 'The forces shaping price, liquidity, and access.'],
  ['Infrastructure', 'The rails carrying value through modern financial systems.'],
  ['Digital Assets', 'A changing asset class within a wider capital system.'],
  ['Financial Networks', 'The institutions and relationships behind capital movement.'],
  ['Artificial Intelligence', 'New intelligence systems changing how decisions are made.'],
  ['Emerging Technologies', 'The technologies redefining future capital formation.'],
] as const;
const audiences = [
  ['Asset Managers', 'Portfolio visibility, allocation intelligence, and strategic awareness.'],
  ['Corporations', 'Capital planning, treasury intelligence, and financial clarity.'],
  ['Family Offices', 'Unified wealth intelligence and decision support.'],
  ['Institutions', 'Research advantage and a deeper understanding of capital.'],
] as const;
const aiCapabilities = [
  ['Predictive Intelligence', 'Identify meaningful changes before they become obvious.'],
  ['Autonomous Research', 'Analyze markets, companies, assets, and trends with institutional context.'],
  ['Institutional Security', 'Private intelligence environment. Controlled access. Data integrity.'],
] as const;

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`web-eyebrow${light ? ' on-light' : ''}`}>{children}</p>;
}

export default function HomePage() {
  return <div className="neptlium-home institutional-home">
    <section className="authority-hero" aria-labelledby="hero-title">
      <div className="web-shell authority-hero-inner">
        <div className="authority-hero-copy">
          <SectionLabel>Capital intelligence</SectionLabel>
          <h1 id="hero-title">Capital,<br />understood<br />before it moves.</h1>
          <p className="authority-hero-lead">Neptlium is an intelligent capital operating environment that transforms fragmented financial information into clear decisions, strategic positioning, and institutional insight.</p>
          <div className="authority-actions">
            <Link className="web-button primary" href={SITE.publicAccessUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></Link>
            <a className="hero-sign-in" href="#contact">Contact Sales</a>
          </div>
        </div>
      </div>
    </section>

    <section className="product-reveal" aria-labelledby="product-reveal-title">
      <div className="web-shell">
        <div className="product-frame">
          <div className="product-topline"><span>NEPTLIUM</span><span>Capital intelligence</span><span>Private environment</span></div>
          <div className="product-body">
            <nav className="product-tabs" aria-label="Product preview navigation"><span className="active">Overview</span><span>Portfolio</span><span>Allocation</span><span>Treasury</span><span>Research</span></nav>
            <div className="product-stage">
              <SectionLabel light>Operating view</SectionLabel>
              <h2 id="product-reveal-title">The system understands capital.</h2>
              <div className="product-signals"><div><span>01</span><strong>Capital context</strong><small>Relationships across the system</small></div><div><span>02</span><strong>Portfolio intelligence</strong><small>Position, exposure, and intent</small></div><div><span>03</span><strong>Strategic signals</strong><small>What deserves attention now</small></div></div>
              <div className="product-empty"><span>Context awaiting connection</span><i aria-hidden="true" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="capital-organization capability-section" aria-labelledby="capabilities-title"><div className="web-shell">
      <header className="section-heading system-heading"><SectionLabel light>One environment</SectionLabel><h2 id="capabilities-title">Every capital decision.</h2><p>Neptlium connects portfolio intelligence, market context, ownership structure, and financial signals into one continuously evolving intelligence layer.</p></header>
      <div className="capability-system">{capabilities.map(([title, description], index) => <article className="capability-row" key={title}><span className="capability-index">{String(index + 1).padStart(2, '0')}</span><div className="capability-copy"><h3>{title}</h3><p>{description}</p></div><ArrowRight aria-hidden="true" /></article>)}</div>
    </div></section>

    <section className="ecosystem-section" aria-labelledby="ecosystem-title"><div className="web-shell">
      <div className="editorial-grid"><div><SectionLabel>Capital ecosystem</SectionLabel><h2 id="ecosystem-title">A clearer view of what shapes capital.</h2></div><p className="editorial-copy">Neptlium maps the companies, markets, technologies, and institutions shaping the future of capital.</p></div>
      <div className="ecosystem-grid">{ecosystem.map(([title, description], index) => <article className="ecosystem-card" key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p><ArrowRight aria-hidden="true" /></article>)}</div>
    </div></section>

    <section className="operating-environment scale-section" aria-labelledby="scale-title"><div className="web-shell editorial-grid"><div><SectionLabel light>Institutional scale</SectionLabel><h2 id="scale-title">Built for institutional-scale intelligence.</h2></div><div className="scale-list">{['Continuous Intelligence', 'Global Perspective', 'Structured Decision Making', 'Transparent Capital Understanding'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item}</h3><p>Designed to preserve context across teams, systems, and decisions.</p></div>)}</div></div></section>

    <section className="capital-organization solutions-section" aria-labelledby="solutions-title"><div className="web-shell"><header className="section-heading system-heading"><SectionLabel light>Solutions</SectionLabel><h2 id="solutions-title">The command center for modern capital.</h2></header><div className="audience-grid">{audiences.map(([title, description]) => <Link href="#contact" className="audience-card" key={title}><h3>{title}</h3><p>{description}</p><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>

    <section className="ai-section" aria-labelledby="ai-title"><div className="web-shell"><div className="architecture-split"><div><SectionLabel>Intelligence layer</SectionLabel><h2 id="ai-title">AI-powered capital intelligence.</h2><p>Neptlium interprets financial signals, identifies meaningful changes, and produces executive-ready intelligence.</p></div><div className="ai-list">{aiCapabilities.map(([title, description]) => <article key={title}><span>—</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></div></section>

    <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="web-shell contact-grid"><div><SectionLabel light>Private conversation</SectionLabel><h2 id="contact-title">Build your capital intelligence environment.</h2><p>Tell us what your institution needs to understand more clearly.</p></div><form className="contact-form"><label>Name<input name="name" type="text" autoComplete="name" /></label><label>Organization<input name="organization" type="text" autoComplete="organization" /></label><label>Role<input name="role" type="text" /></label><label>Email<input name="email" type="email" autoComplete="email" /></label><label className="full-field">Message<textarea name="message" rows={4} /></label><button className="web-button primary" type="submit">Contact Neptlium <ArrowRight aria-hidden="true" /></button></form></div></section>

    <section className="final-authority"><div className="web-shell final-authority-inner"><div><SectionLabel>Neptlium</SectionLabel><h2>The intelligence layer for modern capital.</h2></div><div><p className="authority-hero-lead">Understand what you own, how capital is positioned, and what deserves attention.</p><Link className="web-button secondary" href={SITE.publicAccessUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></Link></div></div></section>
  </div>;
}
