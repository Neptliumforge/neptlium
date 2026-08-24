import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operating Platform for Investment Organizations',
  description:
    'Neptlium brings portfolio context, capital operations, treasury and governed allocation into one institutional operating environment.',
  path: '/',
});

const capabilities = [
  [
    'Portfolio',
    'Bring portfolio context into a coherent operating view designed for informed institutional oversight.',
  ],
  [
    'Capital Account',
    'Organize capital context and movement within one clear operating environment.',
  ],
  [
    'Treasury',
    'Connect liquidity, reserves and capital readiness to the broader portfolio context.',
  ],
  [
    'Allocation',
    'Turn investment intent into a deliberate process for modeling, review and governed action.',
  ],
] as const;

const audiences = [
  [
    'Investment firms',
    'A coordinated operating environment for teams that need portfolio context, treasury discipline and governed allocation.',
  ],
  [
    'Family offices',
    'A clearer structure for understanding capital across operating, portfolio and allocation decisions.',
  ],
  [
    'Treasury teams',
    'Institutional operating context for liquidity, controls and deliberate capital movement.',
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
            <p className="web-eyebrow">Capital operating infrastructure</p>
            <h1 id="home-hero-title">
              <span>A capital operating</span>
              <span>platform for modern</span>
              <em>investment organizations.</em>
            </h1>
            <p className="authority-hero-lead">
              Bring portfolio context, capital operations, treasury and governed allocation into one
              controlled operating environment.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="web-button secondary" href="/platform">
                Explore the platform <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <CapitalArchitecture />
        </div>
        <a
          className="hero-continuation"
          href="#operating-environment"
          aria-label="Continue to the operating environment"
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
            <p className="web-eyebrow on-light">Why Neptlium</p>
            <i className="precision-line" aria-hidden="true" />
            <h2 id="environment-title">One operating environment for fragmented capital work.</h2>
          </div>
          <p>
            Investment operations often separate portfolio context, treasury, capital movement and
            allocation across disconnected systems. Neptlium brings those responsibilities into one
            coherent operating model without reducing every capital decision to a transaction.
          </p>
        </div>
      </section>

      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <div className="web-shell">
          <header className="section-heading">
            <p className="web-eyebrow on-light">The operating environment</p>
            <h2 id="capabilities-title">Capital context, structured for operation.</h2>
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
              Neptlium is designed around a deliberate progression: understand the operating context,
              shape capital intent, review what should change and act through explicit authority.
            </p>
            <ol>
              <li>
                <span>01</span>
                <strong>Understand the operating context</strong>
              </li>
              <li>
                <span>02</span>
                <strong>Shape allocation and treasury intent</strong>
              </li>
              <li>
                <span>03</span>
                <strong>Move forward through explicit authority</strong>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="control-section" aria-labelledby="control-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">Institutional controls</p>
            <h2 id="control-title">Clarity is part of the architecture.</h2>
          </div>
          <div>
            <p>
              Identity, authorization, auditability and controlled capital workflows belong inside
              the operating model—not bolted on after the fact. Neptlium is designed to make those
              boundaries understandable without turning complexity into theatre.
            </p>
            <Link className="editorial-link" href="/security">
              Explore security and control <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="capabilities-section" aria-labelledby="audience-title">
        <div className="web-shell">
          <header className="section-heading">
            <p className="web-eyebrow on-light">Built for institutional teams</p>
            <h2 id="audience-title">A shared operating language for capital.</h2>
          </header>
          <div className="capability-rows">
            {audiences.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-authority" aria-labelledby="final-title">
        <div className="web-shell">
          <p className="web-eyebrow">Neptlium</p>
          <h2 id="final-title">Capital context, put into operation.</h2>
          <p className="authority-hero-lead">
            Explore the Neptlium operating model or start a conversation about a more coherent way to
            organize portfolio, treasury and allocation work.
          </p>
          <div className="authority-actions">
            <Link className="web-button primary" href={SITE.publicAccessUrl}>
              {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="web-button secondary" href="/platform">
              Explore the platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
