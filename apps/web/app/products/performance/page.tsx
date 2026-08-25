import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Performance — Neptlium Products',
  description:
    'Understand the Neptlium performance model: outcomes require authoritative source data, explicit periods, methodology and separation from capital activity.',
  path: '/products/performance',
});

const requirements = [
  ['Authoritative source', 'Performance starts with evidence that can support the stated portfolio scope.'],
  ['Explicit period', 'Every outcome needs a defined time horizon before it can be interpreted responsibly.'],
  ['Methodology', 'The calculation method and assumptions belong with the result rather than behind it.'],
  ['Capital activity separation', 'Deposits, withdrawals and transfers must remain distinguishable from investment outcome.'],
] as const;

export default function PerformancePage() {
  return (
    <div className="architecture-page product-deep-page">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Performance</p>
            <h1>Performance only means something when the context is trustworthy.</h1>
          </div>
          <p className="architecture-lead">
            Neptlium treats performance as an evidence-bound interpretation layer. The public site does
            not present returns or portfolio outcomes, and this product page does not imply that a live
            performance-reporting capability is available for any account.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="performance-requires-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">Interpretation model</p>
            <h2 id="performance-requires-title">Four things must travel with the number.</h2>
            <p>
              A performance figure without provenance, period, methodology and capital-activity context
              can create more certainty than the evidence supports.
            </p>
          </div>
          <div className="architecture-numbered-list">
            {requirements.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="architecture-section architecture-dark">
        <div className="web-shell architecture-statement">
          <p className="web-eyebrow">Product principle</p>
          <h2>Observed, modeled and inferred outcomes should never collapse into one label.</h2>
          <p>
            Neptlium is designed to keep those distinctions visible wherever performance becomes a
            supported product experience.
          </p>
        </div>
      </section>

      <section className="architecture-cta">
        <div className="web-shell architecture-cta-inner">
          <h2>Return performance context to the wider portfolio picture.</h2>
          <Link className="web-button primary" href="/products/portfolio-intelligence">
            Explore Portfolio Intelligence <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
