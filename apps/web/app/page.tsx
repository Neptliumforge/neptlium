import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { PRODUCTS, SOLUTIONS } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'The Operating System for Capital',
  description:
    'Neptlium is capital operating infrastructure for portfolio context, treasury, allocation, capital movement, governance and intelligence.',
  path: '/',
});

const capitalState = ['Portfolio context', 'Liquidity & treasury', 'Capital account'] as const;
const operatingCore = ['Observe', 'Understand', 'Govern'] as const;
const governedWork = ['Treasury coordination', 'Allocation workflows', 'Portfolio intelligence'] as const;
const productResponsibilities = ['Capital movement', 'Liquidity', 'Intent', 'Context'] as const;
const productSummaries = [
  'Funding and capital movement',
  'Liquidity, reserves and readiness',
  'Model, review and govern allocation',
  'Composition, exposure and relationships',
] as const;
const capitalContext = ['Portfolio', 'Liquidity', 'Allocation', 'Capital movement', 'Governance'] as const;
const financialStates = [
  ['Observed', 'What the system can see.'],
  ['Provider-reported', 'What an external source reports.'],
  ['Derived', 'What Neptlium calculates from available information.'],
  ['Modeled', 'What a scenario proposes.'],
  ['Authorized', 'What has received the required authority.'],
  ['Completed', 'What is established as consequential state.'],
] as const;
const governanceLayers = [
  ['Understand', 'Establish what is known, where it came from and how current it is.'],
  ['Review', 'Separate interpretation and modeled intent from authorized state.'],
  ['Govern', 'Keep identity, permissions and consequential operations within explicit control boundaries.'],
] as const;
const boundaries = ['MODELED ≠ EXECUTED', 'PENDING ≠ COMPLETED', 'VISIBLE ≠ AUTHORITATIVE', 'PUBLIC CLIENT ≠ PRIVILEGED AUTHORITY'] as const;

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
        <div className="web-shell authority-hero-inner">
          <div className="authority-hero-copy">
            <p className="web-eyebrow">Capital operating infrastructure</p>
            <h1 id="home-hero-title">The operating system for capital.</h1>
            <p className="authority-hero-lead"><strong>See capital clearly. Coordinate what comes next. Govern how it moves.</strong></p>
            <p className="authority-hero-lead">Neptlium brings portfolio context, treasury, allocation and capital movement into one operating environment.</p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel} <ArrowRight aria-hidden="true" /></Link>
              <Link className="text-arrow-link on-dark" href="#operating-context">Explore the platform <ArrowDown aria-hidden="true" /></Link>
            </div>
          </div>

          <svg className="hero-wave-field" viewBox="0 0 1200 180" width="100%" height="180" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M0 108 C170 28 330 150 500 88 S830 26 1200 96" fill="none" stroke="currentColor" strokeOpacity="0.22" />
            <path d="M0 126 C180 50 350 160 530 104 S870 44 1200 112" fill="none" stroke="currentColor" strokeOpacity="0.14" />
            <path d="M0 90 C150 12 315 132 480 72 S800 10 1200 78" fill="none" stroke="currentColor" strokeOpacity="0.1" />
          </svg>
          <div className="hero-architecture" aria-label="Capital operating domains">
            {['Portfolio context', 'Treasury', 'Allocation', 'Governance'].map((item, index) => (
              <section className="hero-architecture-plane" key={item}>
                <span className="hero-architecture-kicker">{String(index + 1).padStart(2, '0')}</span>
                <h2>{item}</h2>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="operating-context" className="operating-environment" aria-labelledby="context-title">
        <div className="web-shell">
          <header className="section-heading system-heading">
            <p className="web-eyebrow on-light">One operating context</p>
            <h2 id="context-title">Capital should remain intelligible as it moves.</h2>
            <p>Capital activity is often distributed across portfolios, accounts, providers, teams and workflows. Neptlium is designed to preserve the relationships between them so understanding, coordination and authority remain connected.</p>
          </header>
          <div className="hero-architecture" aria-label="Neptlium operating context model">
            <section className="hero-architecture-plane">
              <span className="hero-architecture-kicker">01 / Capital state</span>
              <h2>What is known now.</h2>
              <ul>{capitalState.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section className="hero-architecture-core">
              <span className="hero-architecture-kicker">02 / Neptlium</span>
              <h2>Meaning across the system.</h2>
              <ol>{operatingCore.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol>
            </section>
            <section className="hero-architecture-plane">
              <span className="hero-architecture-kicker">03 / Governed work</span>
              <h2>Context carried forward.</h2>
              <ul>{governedWork.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
        </div>
      </section>

      <section className="capital-organization" aria-labelledby="products-title">
        <div className="web-shell">
          <header className="section-heading system-heading">
            <p className="web-eyebrow on-light">Products</p>
            <h2 id="products-title">Distinct products. One operating language.</h2>
            <p>Each product has a defined responsibility within the wider capital operating model.</p>
          </header>
          <div className="capability-system">
            {PRODUCTS.slice(0, 4).map((product, index) => (
              <Link className="capability-row" href={product.href} key={product.href}>
                <span className="capability-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="capability-copy"><h3>{product.label}</h3><p>{productSummaries[index]}</p></div>
                <span className="capability-signal">{productResponsibilities[index]}</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="section-followup"><Link className="text-arrow-link" href="/products">Explore all products <ArrowRight aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="operating-environment" aria-labelledby="whole-context-title">
        <div className="web-shell editorial-grid">
          <div><p className="web-eyebrow on-light">Capital context</p><h2 id="whole-context-title">One capital context.</h2></div>
          <div className="editorial-copy">
            <p>Portfolio position is only part of the picture. Liquidity affects what is possible. Allocation expresses what may change. Capital movement changes operating state. Governance determines what may proceed.</p>
            <div className="inline-links" aria-label="Connected capital context">{capitalContext.map((item) => <span key={item}>{item}</span>)}</div>
            <h3>Context should survive every handoff.</h3>
            <p>Neptlium is designed to keep those relationships visible as capital moves from observation to understanding, review and governed action.</p>
          </div>
        </div>
      </section>

      <section className="homepage-solutions" aria-labelledby="solutions-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow">Solutions</p>
            <h2 id="solutions-title">Where fragmented capital becomes an operating problem.</h2>
            <Link className="text-arrow-link on-dark" href="/solutions">Explore solutions <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="homepage-solution-list">
            {SOLUTIONS.map((solution, index) => (
              <Link href={solution.href} key={solution.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{solution.label}</h3><p>{solution.description}</p></div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="capital-organization" aria-labelledby="financial-state-title">
        <div className="web-shell">
          <header className="section-heading system-heading">
            <p className="web-eyebrow on-light">Financial state</p>
            <h2 id="financial-state-title">Not every number means the same thing.</h2>
            <p>Neptlium is designed to preserve these distinctions rather than collapse them into a single representation of certainty.</p>
          </header>
          <div className="capability-system">
            {financialStates.map(([state, description], index) => (
              <div className="capability-row" key={state}>
                <span className="capability-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="capability-copy"><h3>{state}</h3><p>{description}</p></div>
                <span className="capability-signal">State</span>
                <span aria-hidden="true">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-section" aria-labelledby="governance-title">
        <div className="web-shell intelligence-grid">
          <div className="intelligence-heading">
            <p className="web-eyebrow">Governance and trust</p>
            <h2 id="governance-title">Clarity before consequence.</h2>
          </div>
          <div className="intelligence-list">
            {governanceLayers.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}
            <div className="intelligence-links"><Link href="/security">Security →</Link><Link href="/trust">Trust →</Link></div>
          </div>
        </div>
      </section>

      <section className="reason-section" aria-labelledby="evidence-title">
        <div className="web-shell reason-grid">
          <p className="web-eyebrow on-light">Architectural evidence</p>
          <div><h2 id="evidence-title">Built around explicit boundaries.</h2><div className="capability-system">{boundaries.map((boundary) => <div className="capability-row" key={boundary}><div className="capability-copy"><h3>{boundary}</h3></div></div>)}</div></div>
        </div>
      </section>

      <section className="operating-environment" aria-labelledby="why-title">
        <div className="web-shell reason-grid">
          <p className="web-eyebrow on-light">Why Neptlium</p>
          <div><h2 id="why-title">Capital infrastructure should preserve context, not create more fragmentation.</h2><p>Neptlium is being built around a simple premise: understanding capital, deciding what should change and governing what happens next should not require reconstructing context across disconnected systems.</p><div className="inline-links"><Link href="/about">About Neptlium</Link></div></div>
        </div>
      </section>

      <section className="capital-organization" aria-labelledby="intelligence-title">
        <div className="web-shell editorial-grid">
          <div><p className="web-eyebrow on-light">Neptlium intelligence</p><h2 id="intelligence-title">Thinking about capital as a system.</h2></div>
          <div className="editorial-copy"><p>Research and operating perspectives from Neptlium will appear here as they are published.</p><Link className="text-arrow-link" href="/resources">Explore resources <ArrowRight aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="final-authority">
        <div className="web-shell final-authority-inner">
          <div><p className="web-eyebrow">Neptlium</p><h2>See capital as one connected system.</h2></div>
          <div><p className="authority-hero-lead">Understand the platform or enter the Neptlium operating environment.</p><div className="authority-actions"><Link className="web-button primary" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel} <ArrowRight aria-hidden="true" /></Link><Link className="text-arrow-link on-dark" href="/platform">Explore the platform <ArrowRight aria-hidden="true" /></Link></div></div>
        </div>
      </section>
    </div>
  );
}
