import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital operating infrastructure',
  description: 'Neptlium connects capital state, operating context, and governed work so financial information remains intelligible before consequence.',
  path: '/',
});

const pillars = [
  ['Capital Account', 'Movement without ambiguity.', 'Understand funding, availability, movement, and lifecycle state without confusing provider activity with canonical financial consequence.'],
  ['Treasury', 'Liquidity with context.', 'Read liquidity, reserves, funding requirements, and operational readiness against the wider capital picture.'],
  ['Allocation', 'Intent before consequence.', 'Model capital intent, compare target states, and preserve the distinction between proposal, review, authorization, and outcome.'],
  ['Portfolio Intelligence', 'Position with evidence.', 'Interpret holdings, exposure, concentration, and liquidity context while keeping source, derived, modeled, and unknown information distinct.'],
] as const;

const financialStates = [
  ['Observed', 'Evidence seen by the system before interpretation.'],
  ['Reported', 'State supplied by an external or internal authority.'],
  ['Derived', 'Information calculated from identified source evidence.'],
  ['Modeled', 'Analytical context that remains distinct from financial fact.'],
  ['Proposed', 'Intent that has not yet become authorized work.'],
  ['Reviewed', 'Work examined without implying approval or execution.'],
  ['Authorized', 'Permission made explicit before consequential action.'],
  ['Consequential', 'Financial effect represented only when the underlying state supports it.'],
] as const;

const solutions = [
  ['Capital visibility', '/solutions#capital-visibility', 'Connect position, liquidity, account, and movement context without losing source or operating meaning.'],
  ['Treasury coordination', '/solutions#treasury-coordination', 'Coordinate liquidity and funding context while preserving timing, state, and authority.'],
  ['Allocation workflows', '/solutions#allocation-workflows', 'Carry capital intent through modeling, review, and authorization without collapsing proposal into outcome.'],
  ['Governance and control', '/solutions#governance-control', 'Keep identity, evidence, review, and consequential authority explicit around sensitive work.'],
] as const;

const principles = [
  ['Evidence before certainty', 'Provider-reported, canonical, derived, modeled, and unknown information keep different meanings.'],
  ['Explicit authority', 'A visible balance is not permission to move it. A model is not an instruction. A review is not execution.'],
  ['Consequence boundaries', 'Public explanation, analytical context, authorization, and consequential work remain distinct.'],
  ['Continuous reconciliation', 'Financial state becomes durable only through verification, reconciliation, and canonical posting where supported.'],
] as const;

const governedLayers = [
  ['Observe', 'Preserve what is known, unknown, reported, and source-backed.'],
  ['Interpret', 'Add context without converting analysis into certainty.'],
  ['Govern', 'Make review, authority, and consequence explicit before sensitive work proceeds.'],
] as const;

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <p className={`web-eyebrow${dark ? ' on-light' : ''}`}>{children}</p>;
}

function OperatingPanel() {
  const relationships = [
    ['Capital state', 'ownership'],
    ['Evidence', 'markets'],
    ['Operating context', 'context'],
    ['Governed work', 'decisions'],
    ['Consequence', 'operations'],
  ] as const;

  return <aside className="operating-panel capital-context-map" aria-label="Neptlium capital operating model">
    <div className="operating-panel-top"><span>NEPTLIUM</span><span>Operating context</span></div>
    <div className="context-map-body">
      <p className="context-map-label">Relationships in view</p>
      <div className="context-map" role="img" aria-label="Capital state and evidence connect through operating context to governed work and consequence">
        {relationships.map(([label, className]) => <div key={label} className={`context-node ${className}`}><span className="context-node-dot" aria-hidden="true" /><span>{label}</span></div>)}
        <span className="context-line context-line-horizontal" aria-hidden="true" />
        <span className="context-line context-line-vertical" aria-hidden="true" />
      </div>
      <p className="context-map-status"><span className="panel-status"><i />System model</span> Clarity before consequence</p>
    </div>
  </aside>;
}

export default function HomePage() {
  return <div className="neptlium-home institutional-home">
    <section className="authority-hero editorial-hero" aria-labelledby="hero-title">
      <div className="web-shell editorial-hero-inner">
        <div className="editorial-hero-copy"><Label>Capital operating infrastructure</Label><h1 id="hero-title">Capital should remain<br />intelligible as it moves.</h1><p className="authority-hero-lead">Neptlium connects capital state, operating context, and governed work so evidence, intent, authority, and consequence remain distinct.</p><div className="authority-actions"><Link className="hero-text-cta" href={SITE.publicAccessUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></Link><a className="hero-secondary-link" href="#intelligence">See the operating model</a></div></div>
        <OperatingPanel />
      </div>
    </section>

    <section className="context-statement" aria-labelledby="context-title"><div className="web-shell context-statement-inner"><div><Label>Clarity before consequence</Label><h2 id="context-title">Financial information should not become more certain simply because it moved through software.</h2></div><p>Neptlium preserves the distinctions between what was observed, what was reported, what was derived or modeled, what was proposed, and what was actually authorized or consequential.</p></div></section>

    <section id="intelligence" className="intelligence-pillars architecture-section" aria-labelledby="pillars-title"><div className="web-shell"><div className="architecture-intro"><div><Label>Operating architecture</Label><h2 id="pillars-title">Capital state.<br />Operating context.<br />Governed work.</h2></div><p>The platform is organized around a simple responsibility: keep capital intelligible as it moves from evidence to interpretation, intent, review, authority, and consequence.</p></div><div className="architecture-map" role="img" aria-label="Capital state connects through operating context to governed work"><div className="architecture-map-title">The Neptlium operating model</div><div className="architecture-map-grid"><span className="architecture-map-node architecture-map-ownership">Capital state</span><span className="architecture-map-node architecture-map-markets">Evidence</span><span className="architecture-map-node architecture-map-context">Operating context</span><span className="architecture-map-node architecture-map-decisions">Governed work</span><span className="architecture-map-node architecture-map-operations">Consequence</span><span className="architecture-map-line architecture-map-line-horizontal" aria-hidden="true" /><span className="architecture-map-line architecture-map-line-vertical" aria-hidden="true" /></div></div><div className="pillar-list architecture-layers">{pillars.map(([title, lead, description], index) => <article className="pillar-row architecture-layer" key={title}><span className="pillar-index">0{index + 1}</span><div><h3>{title}</h3><strong>{lead}</strong><p>{description}</p></div><div className="architecture-signals" aria-label={`${title} responsibilities`}><span>{index === 0 ? 'Movement' : index === 1 ? 'Liquidity' : index === 2 ? 'Intent' : 'Position'}</span><span>{index === 0 ? 'Lifecycle' : index === 1 ? 'Readiness' : index === 2 ? 'Review' : 'Exposure'}</span><span>{index === 0 ? 'State' : index === 1 ? 'Context' : index === 2 ? 'Authority' : 'Evidence'}</span></div><ArrowRight aria-hidden="true" /></article>)}</div><p className="architecture-closing">One operating model. Distinct product responsibilities.</p></div></section>

    <section className="product-experience platform-ecosystem" aria-labelledby="experience-title"><div className="web-shell"><div className="experience-heading"><div><Label dark>Platform continuum</Label><h2 id="experience-title">The operating system for capital.</h2></div><p>Neptlium brings financial state, interpretation, policy, movement, and governance into one operating context without pretending that every surface has the same authority.</p></div><div className="platform-relationship-map" role="img" aria-label="Overview connects Portfolio Intelligence, Capital Account, Treasury, Allocation Intelligence, and Research"><div className="platform-map-title">Connected operating surfaces</div><div className="platform-map-grid"><span className="platform-map-node platform-map-overview">Overview</span><span className="platform-map-node platform-map-portfolio">Portfolio Intelligence</span><span className="platform-map-node platform-map-account">Capital Account</span><span className="platform-map-node platform-map-treasury">Treasury</span><span className="platform-map-node platform-map-allocation">Allocation Intelligence</span><span className="platform-map-node platform-map-research">Research</span><span className="platform-map-line platform-map-line-horizontal" aria-hidden="true" /><span className="platform-map-line platform-map-line-vertical" aria-hidden="true" /></div></div><div className="platform-surfaces" aria-label="Neptlium operating surfaces">{[['Overview', 'Current operating context', 'See governed capital state, attention areas, and the relationships that require understanding.', ['Context', 'Attention', 'State']], ['Portfolio Intelligence', 'Position and exposure context', 'Interpret canonical positions, relationships, concentration, and explicit unknown states.', ['Holdings', 'Exposure', 'Evidence']], ['Capital Account', 'Funding and movement context', 'Understand funding, availability, movement, and lifecycle state without manufacturing settlement authority.', ['Funding', 'Availability', 'Lifecycle']], ['Allocation Intelligence', 'Intent and policy context', 'Model objectives, policy, and proposed decisions while keeping execution explicitly separate.', ['Policy', 'Intent', 'Review']], ['Treasury', 'Liquidity and operational context', 'Understand liquidity, destinations, controls, and readiness without overstating executable capability.', ['Liquidity', 'Controls', 'Readiness']]].map(([title, role, description, signals], index) => <article className="platform-surface-row" key={title as string}><span className="platform-surface-index">0{index + 1}</span><div><h3>{title}</h3><strong>{role}</strong><p>{description}</p></div><div className="platform-surface-signals">{(signals as string[]).map((signal) => <span key={signal}>{signal}</span>)}</div></article>)}</div><p className="platform-closing">Connected context does not erase distinct authority.</p></div></section>

    <section className="ecosystem-map" aria-labelledby="ecosystem-title"><div className="web-shell ecosystem-layout"><div className="ecosystem-copy"><Label>Financial state</Label><h2 id="ecosystem-title">State should remain<br />legible as it changes.</h2><p>Neptlium treats financial information as a progression of evidence and authority, not as a single undifferentiated status.</p></div><div className="ecosystem-tree">{financialStates.map(([title, description], index) => <details key={title} open={index === 0}><summary><span>{title}</span><ChevronDown aria-hidden="true" /></summary><p>{description}</p></details>)}</div></div></section>

    <section className="institutional-intelligence" aria-labelledby="institutional-title"><div className="web-shell institutional-layout"><div><Label dark>Financial truth</Label><h2 id="institutional-title">The system should never claim more than the evidence supports.</h2></div><div className="principle-list">{principles.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>

    <section className="solutions-section" aria-labelledby="solutions-title"><div className="web-shell solutions-layout"><div><Label>Operating problems</Label><h2 id="solutions-title">A clearer path from capital state to governed work.</h2></div><div className="audience-list">{solutions.map(([title, href, description], index) => <Link href={href} key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight aria-hidden="true" /></Link>)}</div></div></section>

    <section className="ai-section" aria-labelledby="ai-title"><div className="web-shell ai-layout"><div><Label>Governed work</Label><h2 id="ai-title">Observe.<br />Interpret.<br />Govern.</h2><p>Intelligence is useful only when its source, uncertainty, authority, and consequences remain visible.</p></div><div className="ai-layers">{governedLayers.map(([title, description], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>
  </div>;
}
