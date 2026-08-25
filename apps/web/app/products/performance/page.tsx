import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Performance — Neptlium Products',
  description:
    'Understand the Neptlium performance model: outcomes require authoritative source data, explicit periods, methodology and separation from capital activity.',
  path: '/products/performance',
});

const evidenceQuestions = [
  ['Source', 'What evidence supports the stated portfolio scope?'],
  ['Period', 'What exact interval does the result describe?'],
  ['Method', 'How was the result calculated and what assumptions matter?'],
  ['Activity', 'Which deposits, withdrawals or transfers must be separated from investment outcome?'],
] as const;

export default function PerformancePage() {
  return (
    <div className="product-story performance-story">
      <section className="performance-hero">
        <div className="web-shell performance-hero-inner">
          <p className="web-eyebrow on-light">Products · Performance</p>
          <h1>Performance is an interpretation, not a decorative number.</h1>
          <p>
            A result only becomes useful when source evidence, period, methodology and capital activity
            travel with it. The public site presents no returns or account performance.
          </p>
        </div>
      </section>

      <section className="performance-evidence" aria-labelledby="performance-evidence-title">
        <div className="web-shell">
          <div className="performance-evidence-heading">
            <span>Before reading any result</span>
            <h2 id="performance-evidence-title">Ask four questions.</h2>
          </div>
          <dl className="performance-question-list">
            {evidenceQuestions.map(([term, description], index) => (
              <div key={term}>
                <dt><span>{String(index + 1).padStart(2, '0')}</span>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="performance-boundary architecture-dark">
        <div className="web-shell performance-boundary-grid">
          <div>
            <p className="web-eyebrow">Interpretation boundary</p>
            <h2>Observed, modeled and inferred outcomes need different labels.</h2>
          </div>
          <p>
            Neptlium is designed to preserve those distinctions wherever performance becomes supported.
            An estimate should not inherit the authority of an observed result merely because both can
            be displayed as a percentage.
          </p>
        </div>
      </section>

      <section className="performance-return-context">
        <div className="web-shell performance-return-grid">
          <div>
            <h2>Return the result to the portfolio that gives it meaning.</h2>
            <p>
              Performance belongs beside composition, concentration, liquidity and capital activity,
              not in isolation from them.
            </p>
          </div>
          <Link className="web-button primary" href="/products/portfolio-intelligence">
            Portfolio Intelligence <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
