import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Products — Capital Operating System',
  description:
    'Explore the Neptlium product family: Capital Account, Treasury, Allocation, Portfolio Intelligence, Performance and Capital Universe.',
  path: '/products',
});

const relationships = [
  ['Capital Account', 'Organize capital movement and account context.'],
  ['Treasury', 'Understand liquidity, reserves and readiness.'],
  ['Allocation', 'Shape intent and review capital roles.'],
  ['Portfolio Intelligence', 'Return decisions to the whole portfolio picture.'],
] as const;

export default function ProductsPage() {
  return (
    <div className="architecture-page products-hub">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products</p>
            <h1>The parts of Neptlium, designed to work as one system.</h1>
          </div>
          <p className="architecture-lead">
            Each Neptlium product has a distinct job. Together they keep capital context, movement,
            liquidity, allocation and intelligence connected without collapsing their responsibilities.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="products-family-title">
        <div className="web-shell">
          <div className="architecture-section-heading">
            <p className="web-eyebrow on-light">Product family</p>
            <h2 id="products-family-title">Six products. One operating language.</h2>
          </div>
          <div className="architecture-link-list">
            {PRODUCTS.map((product, index) => (
              <Link href={product.href} key={product.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{product.label}</h3>
                  <p>{product.description}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="architecture-section architecture-dark" aria-labelledby="products-system-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow">Operating relationship</p>
            <h2 id="products-system-title">Products become useful through their relationships.</h2>
            <p>
              Capital context should remain legible as it moves from account activity to treasury,
              from treasury to allocation, and back into portfolio understanding.
            </p>
          </div>
          <ol className="architecture-sequence">
            {relationships.map(([title, copy], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="architecture-cta">
        <div className="web-shell architecture-cta-inner">
          <div>
            <p className="web-eyebrow on-light">The whole system</p>
            <h2>See how the products become a capital operating environment.</h2>
          </div>
          <Link className="web-button primary" href="/platform">
            Explore platform <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
