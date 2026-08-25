import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PortfolioVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Portfolio Intelligence — Neptlium Products',
  description:
    'See how Neptlium Portfolio Intelligence brings portfolio composition, concentration and liquidity context into one operating view.',
  path: '/products/portfolio-intelligence',
});

const lenses = [
  ['Composition', 'What the portfolio contains where supporting data is available.'],
  ['Concentration', 'Where exposure gathers and deserves attention.'],
  ['Liquidity', 'How liquidity context relates to the positions it affects.'],
  ['Capital role', 'Why a position or pool exists inside the wider operating model.'],
] as const;

export default function PortfolioIntelligencePage() {
  return (
    <div className="product-story portfolio-story">
      <section className="portfolio-hero">
        <div className="web-shell portfolio-hero-grid">
          <div className="portfolio-hero-copy">
            <p className="web-eyebrow on-light">Products · Portfolio Intelligence</p>
            <h1>A portfolio is more useful when its relationships stay visible.</h1>
            <p>
              Portfolio Intelligence connects composition, concentration, liquidity and capital-role
              context without turning incomplete evidence into certainty.
            </p>
          </div>
          <div className="product-story-visual portfolio-primary-visual"><PortfolioVisual /></div>
        </div>
      </section>

      <section className="portfolio-lenses" aria-labelledby="portfolio-lenses-title">
        <div className="web-shell portfolio-lenses-grid">
          <div>
            <p className="web-eyebrow on-light">Four lenses</p>
            <h2 id="portfolio-lenses-title">Read the same portfolio from more than one angle.</h2>
          </div>
          <div className="portfolio-lens-list">
            {lenses.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="portfolio-relationship-field architecture-dark">
        <div className="web-shell">
          <p className="web-eyebrow">System relationship</p>
          <div className="portfolio-relationship-grid">
            <h2>Portfolio context should change the quality of treasury and allocation decisions.</h2>
            <div>
              <p>
                Neptlium treats the portfolio as an operating context rather than a terminal snapshot.
                Decisions can return to the whole picture after movement, modeling or review.
              </p>
              <div className="inline-links">
                <Link href="/products/treasury">Treasury</Link>
                <Link href="/products/allocation">Allocation</Link>
                <Link href="/products/performance">Performance</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-story-close">
        <div className="web-shell product-story-close-grid">
          <h2>A useful portfolio view explains relationships as clearly as positions.</h2>
          <Link className="text-arrow-link" href="/products/performance">
            Continue to Performance <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
