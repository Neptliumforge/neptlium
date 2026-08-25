import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CapitalAccountVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Account — Neptlium Products',
  description:
    'See how Neptlium Capital Account organizes capital movement and account context alongside treasury, allocation and portfolio work.',
  path: '/products/capital-account',
});

const accountStates = [
  ['Context', 'The account sits inside a wider capital picture rather than acting as an isolated balance surface.'],
  ['Intent', 'A planned movement remains distinguishable from an authorized or completed financial outcome.'],
  ['Activity', 'Movement history is meaningful only where authoritative evidence supports it.'],
] as const;

export default function CapitalAccountPage() {
  return (
    <div className="product-story capital-account-story">
      <section className="product-story-hero">
        <div className="web-shell product-story-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Capital Account</p>
            <h1>Capital movement belongs inside the account context that explains it.</h1>
          </div>
          <div className="product-story-intro">
            <p>
              Capital Account organizes funding and movement without separating activity from treasury,
              portfolio and allocation context.
            </p>
            <Link className="text-arrow-link" href="/products">
              All products <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="capital-account-ledger" aria-labelledby="account-structure-title">
        <div className="web-shell capital-account-ledger-grid">
          <div>
            <p className="web-eyebrow on-light">Account structure</p>
            <h2 id="account-structure-title">One account context. Several different kinds of truth.</h2>
            <p>
              Neptlium keeps account context, intended movement and supported activity related without
              presenting them as interchangeable states.
            </p>
          </div>
          <div className="capital-account-state-list">
            {accountStates.map(([title, body], index) => (
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

      <section className="capital-account-visual-section">
        <div className="web-shell capital-account-visual-grid">
          <div className="product-story-visual"><CapitalAccountVisual /></div>
          <div className="product-story-aside">
            <p className="web-eyebrow on-light">Relationship</p>
            <h2>Movement should remain legible before, during and after the decision.</h2>
            <p>
              The product is designed so surrounding capital context stays visible while authority and
              financial outcome remain separate concepts.
            </p>
          </div>
        </div>
      </section>

      <section className="product-story-close architecture-dark">
        <div className="web-shell product-story-close-grid">
          <h2>Movement belongs inside a wider capital picture.</h2>
          <Link className="text-arrow-link on-dark" href="/products/treasury">
            Continue to Treasury <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
