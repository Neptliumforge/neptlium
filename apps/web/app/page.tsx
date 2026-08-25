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

const operatingSequence = [
  ['01', 'Capital Account', 'Capital enters the operating context.'],
  ['02', 'Treasury', 'Liquidity stays visible in context.'],
  ['03', 'Allocation', 'Intent is shaped before action.'],
  ['04', 'Portfolio Intelligence', 'Decisions return to the whole picture.'],
] as const;

const trustLayers = [
  ['Clarity', 'Keep what is visible, modeled, authorized and authoritative conceptually distinct.'],
  ['Governance', 'Make identity, review and control part of the operating model rather than an afterthought.'],
  ['Security', 'Keep privileged operations and sensitive authority outside public browser control.'],
] as const;

export default function HomePage() {
  return (
    <div className="neptlium-home">
      <section className="authority-hero" aria-labelledby="home-hero-title">
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

          <div className="hero-system" aria-label="Illustrative Neptlium operating sequence">
            <div className="hero-system-rule" aria-hidden="true" />
            <ol>
              {operatingSequence.map(([index, title, copy]) => (
                <li key={title}>
                  <span className="hero-system-index">{index}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="hero-system-note">Illustrative operating relationship. No customer financial data shown.</p>
          </div>
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
