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

    <section id="intelligence" className="intelligence-pillars architecture-section" aria-labelledby="pillars-title"><div className="web-shell"><div className="architecture-intro"><div><Label>Intelligence architecture</Label><h2 id="pillars-title">One intelligence layer.<br />Multiple capital perspectives.</h2></div><p>Capital decisions depend on relationships between ownership, markets, information, and operations. Neptlium connects these perspectives into one structured intelligence environment for clearer context and decision support.</p></div><div className="architecture-map" role="img" aria-label="Ownership and markets connect through context to decisions and operations"><div className="architecture-map-title">Capital intelligence</div><div className="architecture-map-grid"><span className="architecture-map-node architecture-map-ownership">Ownership</span><span className="architecture-map-node architecture-map-markets">Markets</span><span className="architecture-map-node architecture-map-context">Context</span><span className="architecture-map-node architecture-map-decisions">Decisions</span><span className="architecture-map-node architecture-map-operations">Operations</span><span className="architecture-map-line architecture-map-line-horizontal" aria-hidden="true" /><span className="architecture-map-line architecture-map-line-vertical" aria-hidden="true" /></div></div><div className="pillar-list architecture-layers">{pillars.map(([title, lead, description], index) => <article className="pillar-row architecture-layer" key={title}><span className="pillar-index">0{index + 1}</span><div><h3>{title}</h3><strong>{lead}</strong><p>{index === 0 ? 'See holdings, exposure, concentration, and ownership relationships across your capital environment.' : index === 1 ? 'Connect market movements, research, and external signals with the assets and systems they affect.' : index === 2 ? 'Transform complex information into clearer priorities, strategic awareness, and informed decisions.' : 'Govern allocation, treasury, reporting, and operational workflows through a connected environment.'}</p></div><div className="architecture-signals" aria-label={`${title} signals`}><span>{index === 0 ? 'Holdings' : index === 1 ? 'Markets' : index === 2 ? 'Context' : 'Allocation'}</span><span>{index === 0 ? 'Exposure' : index === 1 ? 'Research' : index === 2 ? 'Priorities' : 'Treasury'}</span><span>{index === 0 ? 'Structure' : index === 1 ? 'Signals' : index === 2 ? 'Decisions' : 'Governance'}</span></div><ArrowRight aria-hidden="true" /></article>)}</div><p className="architecture-closing">Understanding capital as a connected system.</p></div></section>

    <section className="product-experience platform-ecosystem" aria-labelledby="experience-title"><div className="web-shell"><div className="experience-heading"><div><Label dark>Platform environment</Label><h2 id="experience-title">One environment.<br />Connected capital intelligence.</h2></div><p>Neptlium connects portfolio intelligence, capital operations, allocation, treasury, and research into a unified environment for understanding and governing capital.</p></div><div className="platform-relationship-map" role="img" aria-label="Overview connects Portfolio Intelligence, Capital Account, Treasury, Allocation Intelligence, and Research"><div className="platform-map-title">Connected intelligence surfaces</div><div className="platform-map-grid"><span className="platform-map-node platform-map-overview">Overview</span><span className="platform-map-node platform-map-portfolio">Portfolio Intelligence</span><span className="platform-map-node platform-map-account">Capital Account</span><span className="platform-map-node platform-map-treasury">Treasury</span><span className="platform-map-node platform-map-allocation">Allocation Intelligence</span><span className="platform-map-node platform-map-research">Research</span><span className="platform-map-line platform-map-line-horizontal" aria-hidden="true" /><span className="platform-map-line platform-map-line-vertical" aria-hidden="true" /></div></div><div className="platform-surfaces" aria-label="Neptlium intelligence surfaces">{[['Overview', 'Capital operating view', 'Understand current capital context, attention areas, and connected intelligence across the environment.', ['Context', 'Attention', 'State']], ['Portfolio Intelligence', 'Understanding holdings and exposure', 'Understand positions, relationships, concentration, and strategic portfolio context.', ['Holdings', 'Exposure', 'Relationships']], ['Capital Account', 'Understanding capital availability and movement', 'Understand funding, availability, lifecycle states, and governed capital operations.', ['Funding', 'Availability', 'Movement']], ['Allocation Intelligence', 'Understanding policy and structure', 'Understand allocation frameworks, objectives, and relationships between strategy and capital.', ['Policy', 'Structure', 'Alignment']], ['Treasury', 'Understanding controlled movement and operational capability', 'Understand treasury relationships, destinations, controls, and operational readiness.', ['Controls', 'Infrastructure', 'Governance']]].map(([title, role, description, signals], index) => <article className="platform-surface-row" key={title as string}><span className="platform-surface-index">0{index + 1}</span><div><h3>{title}</h3><strong>{role}</strong><p>{description}</p></div><div className="platform-surface-signals">{(signals as string[]).map((signal) => <span key={signal}>{signal}</span>)}</div></article>)}</div><p className="platform-closing">Every perspective remains connected to the capital context around it.</p></div></section>

    <section className="ecosystem-map" aria-labelledby="ecosystem-title"><div className="web-shell ecosystem-layout"><div className="ecosystem-copy"><Label>Research perspective</Label><h2 id="ecosystem-title">Capital<br />ecosystem</h2><p>A connected view of the companies, markets, technologies, and institutions shaping the future of capital.</p></div><div className="ecosystem-tree">{ecosystem.map(([title, description], index) => <details key={title} open={index === 0}><summary><span>{title}</span><ChevronDown aria-hidden="true" /></summary><p>{description}</p></details>)}</div></div></section>

    <section className="institutional-intelligence" aria-labelledby="institutional-title"><div className="web-shell institutional-layout"><div><Label dark>Institutional intelligence</Label><h2 id="institutional-title">Built for institutional-scale intelligence.</h2></div><div className="principle-list">{principles.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>

    <section className="solutions-section" aria-labelledby="solutions-title"><div className="web-shell solutions-layout"><div><Label>Who uses Neptlium?</Label><h2 id="solutions-title">The operating layer<br />for modern capital.</h2></div><div className="audience-list">{audiences.map(([title, description], index) => <Link href="#intelligence" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>

    <section className="ai-section" aria-labelledby="ai-title"><div className="web-shell ai-layout"><div><Label>Capability layer</Label><h2 id="ai-title">Intelligence<br />that compounds.</h2><p>Neptlium interprets financial signals and creates clearer understanding from complex environments.</p></div><div className="ai-layers">{aiLayers.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>
  </div>;
}
