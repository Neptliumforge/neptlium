import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Capital, organized around you.',
  description: SITE.description,
  alternates: { canonical: '/' },
};

const heroStages = ['Capital', 'Structure', 'Policy', 'Control', 'Operation'] as const;
const sourceSurfaces = ['Wallets', 'Exchanges', 'Custody', 'Networks', 'Treasury systems'] as const;
const operatingNarrative = ['Fragmentation', 'Understanding', 'Organization', 'Intelligence', 'Policy', 'Control', 'Operation'] as const;

function HeroCapitalSystem() {
  return (
    <figure className="hero-capital-system" aria-label="Capital organized from source through controlled operation">
      <div className="hero-capital-core" aria-hidden="true">
        <span className="hero-structure-plane hero-structure-plane-a" />
        <span className="hero-structure-plane hero-structure-plane-b" />
        <span className="hero-structure-axis" />
        <i className="hero-trace hero-trace-a" />
        <i className="hero-trace hero-trace-b" />
      </div>
      <ol>
        {heroStages.map((stage, index) => (
          <li key={stage}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{stage}</strong>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function SystemFlow() {
  return (
    <div className="marketing-system-flow" aria-label="Fragmentation through understanding, organization, intelligence, policy, control and operation">
      <div className="system-flow-sources">
        <span>Fragmented surfaces</span>
        <ul>{sourceSurfaces.map((surface) => <li key={surface}>{surface}</li>)}</ul>
      </div>
      <div className="system-flow-core" aria-label="Neptlium operating layer">
        <span>Operating layer</span>
        <strong>Neptlium</strong>
        <i aria-hidden="true" />
      </div>
      <div className="system-flow-outcomes">
        <span>Operating narrative</span>
        <ol>{operatingNarrative.map((stage, index) => <li key={stage}><b>{String(index + 1).padStart(2, '0')}</b>{stage}</li>)}</ol>
      </div>
    </div>
  );
}

function ProductOperatingSystem() {
  return (
    <div className="marketing-product-system" aria-label="Understanding and organization across Overview, Portfolio and Capital Account">
      <section className="product-system-primary">
        <span>Understanding</span>
        <h3>See capital state before acting on it.</h3>
        <p>Overview gives operators a coherent view of verified capital position, activity, policy context and the next governed action.</p>
        <div className="product-system-lines" aria-hidden="true"><i /><i /><i /></div>
      </section>
      <section className="product-system-plane product-system-portfolio">
        <span>Organization · Portfolio</span>
        <strong>Exposure · concentration · liquidity · classification</strong>
        <p>Capital structure is organized without fabricated balances, returns or live positions.</p>
      </section>
      <section className="product-system-plane product-system-account">
        <span>Organization · Capital Account</span>
        <strong>Readiness · activity · controlled capital movement</strong>
        <p>Capability remains explicit and never presented as available before it is verified.</p>
      </section>
    </div>
  );
}

function TreasuryAllocationConnectivity() {
  return (
    <div className="marketing-capital-stack" aria-label="Intelligence, policy and connectivity beneath capital operations">
      <section className="capital-stack-treasury">
        <span>01 · Intelligence</span>
        <h3>Turn capital state into operating context.</h3>
        <p>Treasury organizes liquidity, reserves and operating capacity so decisions begin from a coherent capital picture.</p>
      </section>
      <section className="capital-stack-focus">
        <span>02 · Policy</span>
        <h3>Model policy before authorization.</h3>
        <ol aria-label="Allocation lifecycle"><li>Observe</li><li>Model</li><li>Authorize</li></ol>
        <p>Authorization does not imply autonomous execution or active rebalancing.</p>
      </section>
      <section className="capital-stack-connectivity">
        <span>03 · Infrastructure</span>
        <h3>Connect evidence beneath operation.</h3>
        <p>Neptlium Link supports provider and network connectivity while remaining infrastructure beneath governed capital state.</p>
      </section>
    </div>
  );
}

function GovernanceFoundation() {
  const foundations = [
    ['Authorization', 'Identity and permission boundaries remain explicit before privileged capital operations.'],
    ['Ledger', 'Canonical financial state is separated from provider evidence and interface representation.'],
    ['Reconciliation', 'Provider evidence and canonical records are compared before capital becomes operationally available.'],
  ] as const;

  return (
    <div className="marketing-governance-foundation" aria-label="Control through authorization, ledger and reconciliation">
      {foundations.map(([title, copy], index) => (
        <section key={title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div><h3>{title}</h3><p>{copy}</p></div>
          {index < foundations.length - 1 ? <i aria-hidden="true">→</i> : null}
        </section>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="production-home marketing-six-compositions">
      <section className="production-hero marketing-composition marketing-composition-hero" aria-labelledby="home-hero-title" data-composition="1">
        <div className="production-shell production-hero-grid">
          <div className="production-hero-copy">
            <span className="production-hero-eyebrow">DIGITAL CAPITAL OPERATING INFRASTRUCTURE</span>
            <h1 id="home-hero-title">Capital, organized around you.</h1>
            <p>Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment.</p>
            <div className="production-hero-actions">
              <a className="button production-primary" href={SITE.signInUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></a>
              <Link className="production-secondary" href="/platform">Explore the platform</Link>
            </div>
          </div>
          <Reveal className="production-hero-proof"><HeroCapitalSystem /></Reveal>
        </div>
      </section>

      <section className="marketing-composition marketing-thesis" aria-labelledby="thesis-title" data-composition="2">
        <div className="production-shell">
          <div className="marketing-editorial-heading">
            <Reveal><span>Fragmentation</span><h2 id="thesis-title">Digital capital is fragmented by default.</h2></Reveal>
            <Reveal><p>Wallets, exchanges, custodians, networks and treasury systems often operate as separate financial surfaces. Neptlium creates one governed operating layer across them.</p></Reveal>
          </div>
          <Reveal><SystemFlow /></Reveal>
        </div>
      </section>

      <section className="marketing-composition marketing-product" aria-labelledby="product-system-title" data-composition="3">
        <div className="production-shell">
          <div className="marketing-editorial-heading">
            <Reveal><span>Understanding → Organization</span><h2 id="product-system-title">Understand capital. Then organize it.</h2></Reveal>
            <Reveal><p>Overview, Portfolio and Capital Account work together to turn scattered capital state into a coherent operating structure without inventing evidence.</p></Reveal>
          </div>
          <Reveal><ProductOperatingSystem /></Reveal>
        </div>
      </section>

      <section className="marketing-composition marketing-capital-operations" aria-labelledby="capital-operations-title" data-composition="4">
        <div className="production-shell">
          <div className="marketing-editorial-heading light-on-dark">
            <Reveal><span>Intelligence → Policy</span><h2 id="capital-operations-title">Turn structure into governed decisions.</h2></Reveal>
            <Reveal><p>Treasury provides operating intelligence. Allocation expresses policy and drift. Connectivity supplies infrastructure evidence without replacing canonical state.</p></Reveal>
          </div>
          <Reveal><TreasuryAllocationConnectivity /></Reveal>
        </div>
      </section>

      <section className="marketing-composition marketing-governance" aria-labelledby="governance-title" data-composition="5">
        <div className="production-shell">
          <div className="marketing-editorial-heading">
            <Reveal><span>Control</span><h2 id="governance-title">Control is part of the architecture.</h2></Reveal>
            <Reveal><p>Identity, authorization, policy boundaries, provider isolation, canonical ledger state and reconciliation remain explicit throughout the capital lifecycle.</p></Reveal>
          </div>
          <Reveal><GovernanceFoundation /></Reveal>
        </div>
      </section>

      <section className="marketing-composition marketing-conversion" aria-labelledby="conversion-title" data-composition="6">
        <div className="production-shell marketing-conversion-inner">
          <Reveal>
            <span>Operation</span>
            <h2 id="conversion-title">Capital, made operational.</h2>
            <p>Move from fragmentation to controlled operation through verified state, explicit policy and governed authority.</p>
            <div className="production-hero-actions conversion-actions">
              <a className="button production-primary" href={SITE.signInUrl}>Enter Neptlium <ArrowRight aria-hidden="true" /></a>
              <Link className="production-secondary" href="/platform">Explore the platform</Link>
              <Link className="production-secondary" href="/contact">Talk to Neptlium</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
