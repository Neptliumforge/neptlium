import Link from 'next/link';
import { ArrowRight, ChevronDown, Search } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'The intelligence layer for modern capital',
  description: 'Neptlium helps institutions understand position, change, and strategic attention.',
  path: '/',
});

const pillars = [
  ['Ownership Intelligence', 'Understand what you own.', 'Holdings, exposure, concentration, and strategic position.'],
  ['Market Intelligence', 'Understand what changes.', 'Market movement, opportunity, and context.'],
  ['Decision Intelligence', 'Understand what matters.', 'Move from data to context to decision.'],
  ['Capital Operations', 'Understand what happens next.', 'Oversight, allocation, reporting, and planning.'],
] as const;
const ecosystem = [
  ['Markets', 'The forces shaping price, liquidity, and access.'],
  ['Infrastructure', 'The rails carrying value through modern financial systems.'],
  ['Financial Networks', 'The institutions and relationships behind capital movement.'],
  ['Digital Assets', 'A changing asset class within a wider capital system.'],
  ['Artificial Intelligence', 'New intelligence systems changing how decisions are made.'],
  ['Emerging Technologies', 'Technologies redefining future capital formation.'],
] as const;
const audiences = [
  ['Asset Managers', 'See portfolio position, allocation intelligence, and strategic awareness in context.'],
  ['Corporations', 'Bring capital planning, treasury intelligence, and financial clarity together.'],
  ['Family Offices', 'Create unified wealth intelligence and decision support.'],
  ['Institutions', 'Build research advantage and deeper capital understanding.'],
] as const;
const principles = [
  ['Continuous Intelligence', 'Context preserved across changing environments.'],
  ['Global Perspective', 'Connected understanding across markets and systems.'],
  ['Structured Decisions', 'Information organized for better judgment.'],
  ['Transparent Understanding', 'Know what changed and why.'],
] as const;
const aiLayers = [
  ['Predict', 'Identify meaningful changes.'],
  ['Research', 'Understand markets, entities, and trends.'],
  ['Secure', 'Maintain institutional control.'],
] as const;

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={`web-eyebrow${dark ? ' on-light' : ''}`}>{children}</p>;
}

function OperatingPanel() {
  const relationships = [
    ['Ownership', 'ownership'],
    ['Markets', 'markets'],
    ['Context', 'context'],
    ['Decisions', 'decisions'],
    ['Operations', 'operations'],
  ] as const;

  return <aside className="operating-panel capital-context-map" aria-label="Neptlium capital context map">
    <div className="operating-panel-top"><span>NEPTLIUM</span><span>Capital context</span></div>
    <div className="context-map-body">
      <p className="context-map-label">Relationships in view</p>
      <div className="context-map" role="img" aria-label="Ownership and markets connect through context to decisions and operations">
        {relationships.map(([label, className]) => <div key={label} className={`context-node ${className}`}><span className="context-node-dot" aria-hidden="true" /><span>{label}</span></div>)}
        <span className="context-line context-line-horizontal" aria-hidden="true" />
        <span className="context-line context-line-vertical" aria-hidden="true" />
      </div>
      <p className="context-map-status"><span className="panel-status"><i />System state</span> Context connected</p>
    </div>
  </aside>;
}

export default function HomePage() {
  return <div className="neptlium-home institutional-home">
    <section className="authority-hero editorial-hero" aria-labelledby="hero-title">
      <div className="web-shell editorial-hero-inner">
        <div className="editorial-hero-copy"><Label>Neptlium · Capital intelligence infrastructure</Label><h1 id="hero-title">The intelligence layer for modern capital.</h1><p className="authority-hero-lead">Neptlium connects ownership, markets, decisions, and capital operations into one intelligent environment.</p><div className="authority-actions"><Link className="hero-text-cta" href={SITE.publicAccessUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></Link><a className="hero-secondary-link" href="#intelligence">Explore Intelligence</a></div></div>
        <OperatingPanel />
      </div>
    </section>

    <section className="context-statement" aria-labelledby="context-title"><div className="web-shell context-statement-inner"><div><Label>Context is the advantage</Label><h2 id="context-title">Capital becomes difficult<br />when information loses context.</h2></div><p>Neptlium reconnects the relationships between ownership, markets, and decisions.</p></div></section>

    <section id="intelligence" className="intelligence-pillars" aria-labelledby="pillars-title"><div className="web-shell"><div className="section-intro"><Label>Intelligence architecture</Label><h2 id="pillars-title">Understand the whole system.</h2></div><div className="pillar-list">{pillars.map(([title, lead, description], index) => <article className="pillar-row" key={title}><span className="pillar-index">0{index + 1}</span><div><h3>{title}</h3><strong>{lead}</strong><p>{description}</p></div><ArrowRight aria-hidden="true" /></article>)}</div></div></section>

    <section className="product-experience" aria-labelledby="experience-title"><div className="web-shell"><div className="experience-heading"><Label dark>Product experience</Label><h2 id="experience-title">One environment.<br />Every capital decision.</h2><p>A living system for the relationships, signals, and context behind capital.</p></div><div className="experience-surface"><div className="experience-nav">{['Overview', 'Portfolio', 'Allocation', 'Treasury', 'Research'].map((item, index) => <span className={index === 0 ? 'active' : ''} key={item}>{item}</span>)}</div><div className="experience-canvas"><div className="canvas-topline"><span>Overview / Operating view</span><span>Context state</span></div><div className="canvas-core"><span className="canvas-kicker">Capital intelligence</span><h3>Relationships,<br />made visible.</h3><div className="canvas-trace"><i /><span>Position</span><i /><span>Change</span><i /><span>Attention</span></div></div><div className="canvas-foot"><span>System state</span><strong>Awaiting connected context</strong></div></div></div></div></section>

    <section className="ecosystem-map" aria-labelledby="ecosystem-title"><div className="web-shell ecosystem-layout"><div className="ecosystem-copy"><Label>Research perspective</Label><h2 id="ecosystem-title">Capital<br />ecosystem</h2><p>A connected view of the companies, markets, technologies, and institutions shaping the future of capital.</p></div><div className="ecosystem-tree">{ecosystem.map(([title, description], index) => <details key={title} open={index === 0}><summary><span>{title}</span><ChevronDown aria-hidden="true" /></summary><p>{description}</p></details>)}</div></div></section>

    <section className="institutional-intelligence" aria-labelledby="institutional-title"><div className="web-shell institutional-layout"><div><Label dark>Institutional intelligence</Label><h2 id="institutional-title">Built for institutional-scale intelligence.</h2></div><div className="principle-list">{principles.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>

    <section className="solutions-section" aria-labelledby="solutions-title"><div className="web-shell solutions-layout"><div><Label>Who uses Neptlium?</Label><h2 id="solutions-title">The operating layer<br />for modern capital.</h2></div><div className="audience-list">{audiences.map(([title, description], index) => <Link href="#intelligence" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>

    <section className="ai-section" aria-labelledby="ai-title"><div className="web-shell ai-layout"><div><Label>Capability layer</Label><h2 id="ai-title">Intelligence<br />that compounds.</h2><p>Neptlium interprets financial signals and creates clearer understanding from complex environments.</p></div><div className="ai-layers">{aiLayers.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>
  </div>;
}
