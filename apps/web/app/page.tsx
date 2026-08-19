import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Digital capital, organized around you.',
  description:
    'A capital operating environment for visibility, treasury context, and governed allocation.',
  alternates: { canonical: '/' },
};

const capabilities = [
  [
    'Portfolio visibility',
    'Bring capital context into a coherent view designed for informed oversight.',
  ],
  [
    'Capital Account',
    'Coordinate capital movement through a clear operating surface without implying capability before it is available.',
  ],
  [
    'Treasury',
    'Understand liquidity and operating structure without collapsing evidence into financial truth.',
  ],
  [
    'Allocation',
    'Move from intent to governed allocation decisions through explicit, controlled workflows.',
  ],
] as const;

function CapitalArchitecture() {
  return (
    <div className="capital-architecture" aria-hidden="true">
      <span className="architecture-plane plane-a" />
      <span className="architecture-plane plane-b" />
      <span className="architecture-plane plane-c" />
      <span className="architecture-arc arc-a" />
      <span className="architecture-arc arc-b" />
      <span className="architecture-axis" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
        <div className="web-shell authority-hero-grid">
          <div className="authority-hero-copy">
            <p className="web-eyebrow">Digital capital operating infrastructure</p>
            <h1 id="home-hero-title">
              <span>Digital capital,</span>
              <span>organized</span>
              <em>around you.</em>
            </h1>
            <p className="authority-hero-lead">
              A capital operating environment for visibility, treasury context, and governed
              allocation.
            </p>
            <div className="authority-actions">
              <a className="web-button primary" href={SITE.signInUrl}>
                Open Neptlium <ArrowRight aria-hidden="true" />
              </a>
              <Link className="web-button secondary" href="/platform">
                Explore platform <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <CapitalArchitecture />
        </div>
        <a
          className="hero-continuation"
          href="#operating-environment"
          aria-label="Continue to One operating environment"
        >
          <span />
        </a>
      </section>

      <section
        className="editorial-intro"
        id="operating-environment"
        aria-labelledby="environment-title"
      >
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">Built for institutional capital</p>
            <i className="precision-line" aria-hidden="true" />
            <h2 id="environment-title">One operating environment</h2>
          </div>
          <p>
            Bring portfolio visibility, treasury context, capital movement, and allocation into one
            coordinated operating environment.
          </p>
        </div>
      </section>

      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <div className="web-shell">
          <header className="section-heading">
            <p className="web-eyebrow on-light">Core platform capabilities</p>
            <h2 id="capabilities-title">Capital context, without the noise.</h2>
          </header>
          <div className="capability-rows">
            {capabilities.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="operations-section" aria-labelledby="operations-title">
        <div className="web-shell operations-grid">
          <div>
            <p className="web-eyebrow">Treasury · allocation · capital operations</p>
            <h2 id="operations-title">From visibility to governed action.</h2>
          </div>
          <div className="operations-narrative">
            <p>
              Neptlium coordinates treasury context and allocation intent while keeping authority,
              availability, and execution distinct.
            </p>
            <ol>
              <li>
                <span>01</span>
                <strong>Understand the operating context</strong>
              </li>
              <li>
                <span>02</span>
                <strong>Shape governed allocation</strong>
              </li>
              <li>
                <span>03</span>
                <strong>Act through explicit authority</strong>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="control-section" aria-labelledby="control-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">Institutional control</p>
            <h2 id="control-title">Clarity is part of the architecture.</h2>
          </div>
          <div>
            <p>
              Neptlium is designed around visible boundaries, deliberate decisions, and a clear
              separation between interface representation and domain truth.
            </p>
            <Link className="editorial-link" href="/security">
              Explore security and control <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="final-authority" aria-labelledby="final-title">
        <div className="web-shell">
          <p className="web-eyebrow">A coordinated capital environment</p>
          <h2 id="final-title">Put capital context into operation.</h2>
          <div className="authority-actions">
            <a className="web-button primary" href={SITE.signInUrl}>
              Open Neptlium <ArrowRight aria-hidden="true" />
            </a>
            <Link className="web-button secondary" href="/contact">
              Talk to Neptlium
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
