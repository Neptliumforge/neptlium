import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TreasuryVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Treasury — Neptlium Products',
  description:
    'See how Neptlium Treasury keeps liquidity, reserves and capital readiness connected to the wider capital operating picture.',
  path: '/products/treasury',
});

const readiness = [
  ['Observed', 'What can be supported by the available evidence.'],
  ['Reserved', 'Capital intentionally preserved for a defined purpose.'],
  ['Available', 'Capital that may be usable within the applicable operating constraints.'],
  ['Ready', 'A stronger operational state that should not be inferred from visibility alone.'],
] as const;

export default function TreasuryPage() {
  return (
    <div className="product-story treasury-story">
      <section className="treasury-hero">
        <div className="web-shell treasury-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Treasury</p>
            <h1>Liquidity is useful only when its operating state is clear.</h1>
          </div>
          <div className="treasury-hero-note">
            <p>
              Treasury connects liquidity and reserve context to the decisions around it without turning
              a visible balance into a claim of readiness.
            </p>
          </div>
        </div>
      </section>

      <section className="treasury-readiness" aria-labelledby="readiness-title">
        <div className="web-shell">
          <div className="treasury-readiness-heading">
            <p className="web-eyebrow on-light">Capital readiness</p>
            <h2 id="readiness-title">Four states that should not collapse into one number.</h2>
          </div>
          <div className="treasury-readiness-line">
            {readiness.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="treasury-context-band">
        <div className="web-shell treasury-context-grid">
          <div className="product-story-visual"><TreasuryVisual /></div>
          <div>
            <p className="web-eyebrow">Operating context</p>
            <h2>Treasury sits between what capital is and what the organization intends to do next.</h2>
            <p>
              It connects back to Capital Account for movement context and forward to Allocation for
              decision context while retaining its own responsibility for liquidity interpretation.
            </p>
          </div>
        </div>
      </section>

      <section className="treasury-links">
        <div className="web-shell treasury-link-row">
          <Link href="/products/capital-account">Capital Account</Link>
          <span aria-hidden="true">→</span>
          <strong>Treasury</strong>
          <span aria-hidden="true">→</span>
          <Link href="/products/allocation">Allocation</Link>
        </div>
      </section>

      <section className="product-story-close">
        <div className="web-shell product-story-close-grid">
          <h2>See liquidity in the context that gives it meaning.</h2>
          <Link className="text-arrow-link" href="/products/allocation">
            Continue to Allocation <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
