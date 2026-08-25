import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS, SOLUTIONS } from '@/lib/content/public-architecture';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'The Operating System for Capital',
  description:
    'Neptlium brings treasury, allocation, capital movement and portfolio context into one operating system.',
  path: '/',
});

const capitalState = ['Portfolio context', 'Liquidity & treasury', 'Capital account'] as const;
const operatingCore = ['Observe', 'Understand', 'Govern'] as const;
const governedWork = ['Treasury coordination', 'Allocation workflows', 'Portfolio intelligence'] as const;

const trustLayers = [
  ['Clarity', 'Keep what is visible, modeled, authorized and authoritative conceptually distinct.'],
  ['Governance', 'Make identity, review and control part of the operating model rather than an afterthought.'],
  ['Security', 'Keep privileged operations and sensitive authority outside public browser control.'],
] as const;

function AuthorityWaveField() {
  return (
    <svg
      className="authority-wave-field"
      viewBox="0 0 1600 760"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="authority-wave-field-primary">
        <path d="M-80 575 C 230 355, 430 330, 700 468 S 1160 672, 1690 328" />
        <path d="M-90 625 C 220 405, 430 375, 700 515 S 1165 720, 1700 378" />
        <path d="M-110 680 C 205 455, 420 425, 700 566 S 1175 770, 1710 430" />
      </g>
      <g className="authority-wave-field-secondary">
        <path d="M785 -55 C 960 165, 1008 280, 955 404 S 910 638, 1160 820" />
        <path d="M885 -70 C 1045 142, 1098 270, 1040 405 S 1010 654, 1270 820" />
      </g>
      <path className="authority-wave-field-signal" d="M-40 513 C 265 308, 455 300, 715 432 S 1170 623, 1650 300" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
        <AuthorityWaveField />
        <div className="web-shell authority-hero-inner">
          <div className="authority-hero-copy">
            <h1 id="home-hero-title">The operating system for capital.</h1>
            <p className="authority-hero-lead">
              See, coordinate and govern capital across treasury, allocation and portfolio context.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="text-arrow-link on-dark" href="/platform">
                Explore platform <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hero-architecture" aria-label="Illustrative Neptlium capital operating architecture">
            <section className="hero-architecture-plane" aria-labelledby="hero-capital-state">
              <span className="hero-architecture-kicker">01 / Capital state</span>
              <h2 id="hero-capital-state">Keep the whole position in context.</h2>
              <ul>
                {capitalState.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <div className="hero-architecture-connector" aria-hidden="true"><span /></div>

            <section className="hero-architecture-core" aria-labelledby="hero-operating-core">
              <span className="hero-architecture-kicker">02 / Neptlium</span>
              <h2 id="hero-operating-core">One operating context.</h2>
              <ol>
                {operatingCore.map((item, index) => (
                  <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
                ))}
              </ol>
            </section>

            <div className="hero-architecture-connector" aria-hidden="true"><span /></div>

            <section className="hero-architecture-plane" aria-labelledby="hero-governed-work">
              <span className="hero-architecture-kicker">03 / Governed work</span>
              <h2 id="hero-governed-work">Move forward without losing state.</h2>
              <ul>
                {governedWork.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>
          <p className="hero-system-note">Illustrative operating architecture. No customer financial data shown.</p>
        </div>
      </section>

      <section className="operating-environment" aria-labelledby="environment-title">
        <div className="web-shell editorial-grid">
          <div>
            <p className="web-eyebrow on-light">The operating model</p>
            <h2 id="environment-title">Capital should not lose context as it moves.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Investment context, liquidity, capital movement and allocation are often separated by
              tools, teams and handoffs. Neptlium is designed to keep those relationships visible.
            </p>
            <Link className="text-arrow-link" href="/platform">
              See how the platform works <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="capital-organization" aria-labelledby="products-title">
        <div className="web-shell">
          <header className="section-heading system-heading">
            <p className="web-eyebrow on-light">Products</p>
            <h2 id="products-title">Distinct products, one operating language.</h2>
            <p>
              Each product has a clear responsibility. The system becomes useful through the
              relationships between them.
            </p>
          </header>

          <div className="capability-system">
            {PRODUCTS.slice(0, 4).map((product, index) => (
              <Link className="capability-row" href={product.href} key={product.href}>
                <span className="capability-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="capability-copy">
                  <h3>{product.label}</h3>
                  <p>{product.description}</p>
                </div>
                <span className="capability-signal">Product</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="section-followup">
            <Link className="text-arrow-link" href="/products">
              Explore all products <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="homepage-solutions" aria-labelledby="solutions-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow">Solutions</p>
            <h2 id="solutions-title">Start with the operating problem.</h2>
            <p>
              Neptlium is most useful where capital visibility, treasury coordination, allocation and
              control have become fragmented across separate systems.
            </p>
            <Link className="text-arrow-link on-dark" href="/solutions">
              Explore solutions <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="homepage-solution-list">
            {SOLUTIONS.slice(0, 3).map((solution, index) => (
              <Link href={solution.href} key={solution.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{solution.label}</h3>
                  <p>{solution.description}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-section" aria-labelledby="intelligence-title">
        <div className="web-shell intelligence-grid">
          <div className="intelligence-heading">
            <p className="web-eyebrow">Intelligence, governance and trust</p>
            <h2 id="intelligence-title">Clarity before consequence.</h2>
            <p>
              Neptlium is designed to make the difference between understanding, modeling, reviewing
              and acting visible rather than collapsing them into one moment.
            </p>
          </div>
          <div className="intelligence-list">
            {trustLayers.map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
            <div className="intelligence-links">
              <Link href="/security">Security</Link>
              <Link href="/trust">Trust</Link>
              <Link href="/resources">Resources</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="reason-section" aria-labelledby="reason-title">
        <div className="web-shell reason-grid">
          <p className="web-eyebrow on-light">Why Neptlium exists</p>
          <div>
            <h2 id="reason-title">Complex capital deserves a simpler operating language.</h2>
            <p>
              Neptlium exists to reduce the distance between knowing where capital stands,
              understanding what should change, and moving forward with the right context and control.
            </p>
            <div className="inline-links home-company-links">
              <Link href="/about">About Neptlium</Link>
              <Link href="/company">Company</Link>
              <Link href="/learn">Learn</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="final-authority" aria-labelledby="final-title">
        <div className="web-shell final-authority-inner">
          <div>
            <p className="web-eyebrow">Neptlium</p>
            <h2 id="final-title">See capital as one connected system.</h2>
          </div>
          <div>
            <p className="authority-hero-lead">
              Enter Neptlium or continue through the public architecture to understand the system in
              more depth.
            </p>
            <div className="authority-actions">
              <Link className="web-button primary" href={SITE.publicAccessUrl}>
                {SITE.publicAccessLabel} <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="text-arrow-link on-dark" href="/products">
                Explore products <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
