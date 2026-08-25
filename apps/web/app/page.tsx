import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operating Platform for Investment Organizations',
  description:
    'Neptlium brings portfolio context, capital movement, treasury and allocation into one clear capital operating platform.',
  path: '/',
});

const platformAreas = [
  ['Portfolio', 'See what you own and understand it in context.', '/portfolio-intelligence'],
  ['Capital Account', 'Keep capital movement organized and visible.', '/capital-account'],
  ['Treasury', 'See liquidity alongside the rest of your capital picture.', '/treasury'],
  ['Allocation', 'Model where capital should go before anything moves.', '/allocation'],
] as const;

const audiences = [
  ['Investment firms', 'Bring investment context and capital operations into one shared view.'],
  ['Family offices', 'Keep portfolio, liquidity and allocation conversations connected.'],
  ['Treasury teams', 'See where capital stands before deciding what happens next.'],
] as const;

function ProductContextIllustration() {
  return (
    <div className="product-context" aria-label="Illustrative Neptlium platform relationship">
      <div className="product-context-head">
        <span>Neptlium</span>
        <span>Capital context</span>
      </div>
      <div className="product-context-grid">
        <div className="product-context-primary">
          <span className="product-context-label">Portfolio</span>
          <strong>Understand the whole picture.</strong>
          <p>Bring positions, capital context and operating decisions into one place.</p>
        </div>
        <div className="product-context-stack">
          <div>
            <span>Treasury</span>
            <strong>Liquidity in context</strong>
          </div>
          <div>
            <span>Allocation</span>
            <strong>Intent before action</strong>
          </div>
          <div>
            <span>Control</span>
            <strong>Review stays explicit</strong>
          </div>
        </div>
      </div>
      <p className="product-context-note">Illustrative platform composition. No customer financial data is shown.</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
        <div className="web-shell authority-hero-grid">
          <div className="authority-hero-copy">
            <p className="web-eyebrow">Capital operating platform</p>
            <h1 id="home-hero-title">Bring your capital work into one place.</h1>
            <p className="authority-hero-lead">
              See portfolio context, capital movement, treasury and allocation together — with the
              controls your team needs to move deliberately.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="web-button secondary" href={SITE.exploreUrl}>
                {SITE.exploreLabel} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <ProductContextIllustration />
        </div>
      </section>

      <section className="editorial-intro" aria-labelledby="connected-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">Why Neptlium</p>
            <h2 id="connected-title">Keep the work connected.</h2>
          </div>
          <p>
            Portfolio context, treasury and allocation often sit in separate systems and separate
            conversations. Neptlium brings them together so your team can see what matters before
            deciding what happens next.
          </p>
        </div>
      </section>

      <section className="platform-section" aria-labelledby="platform-title">
        <div className="web-shell">
          <header className="section-heading compact-heading">
            <p className="web-eyebrow on-light">The platform</p>
            <h2 id="platform-title">See how the pieces fit together.</h2>
          </header>
          <div className="platform-list">
            {platformAreas.map(([title, copy, href], index) => (
              <Link className="platform-list-item" href={href} key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="operations-section" aria-labelledby="operations-title">
        <div className="web-shell operations-grid">
          <div>
            <p className="web-eyebrow">From context to action</p>
            <h2 id="operations-title">Plan before you move.</h2>
          </div>
          <div className="operations-narrative">
            <p>
              Understand where things stand, shape what should change, review it with the right people,
              and keep authority explicit before capital moves.
            </p>
            <ol>
              <li>
                <span>01</span>
                <strong>Understand the current context</strong>
              </li>
              <li>
                <span>02</span>
                <strong>Shape treasury and allocation intent</strong>
              </li>
              <li>
                <span>03</span>
                <strong>Move forward with clear authority</strong>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="control-section" aria-labelledby="control-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">Control</p>
            <h2 id="control-title">Move with the right controls.</h2>
          </div>
          <div>
            <p>
              Identity, authorization, review and auditability stay part of the workflow from the
              start. The goal is simple: make important capital decisions easier to understand without
              hiding the boundaries around them.
            </p>
            <Link className="editorial-link" href="/security">
              Explore security and control <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="audience-section" aria-labelledby="audience-title">
        <div className="web-shell">
          <header className="section-heading compact-heading">
            <p className="web-eyebrow on-light">Built for capital teams</p>
            <h2 id="audience-title">A clearer way to work together.</h2>
          </header>
          <div className="audience-grid">
            {audiences.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="final-authority" aria-labelledby="final-title">
        <div className="web-shell final-authority-inner">
          <div>
            <p className="web-eyebrow">Neptlium</p>
            <h2 id="final-title">Keep your capital work connected.</h2>
          </div>
          <div>
            <p className="authority-hero-lead">
              Bring portfolio context, treasury and allocation into one clear operating platform.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="web-button secondary" href={SITE.exploreUrl}>
                {SITE.exploreLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
