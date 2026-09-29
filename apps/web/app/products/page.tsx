import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';
import { PRODUCTS } from '@/lib/content/public-architecture';

export const metadata = createPageMetadata({
  title: 'Products — Neptlium',
  description: 'Explore the Neptlium Capital, Treasury, Institutional and Infrastructure product families.',
  path: '/products',
});

export default function ProductsPage() {
  return (
    <main className="family-page" data-npt-surface="ivory">
      <div className="family-shell">
        <section className="family-hero" aria-labelledby="products-title">
          <div>
            <p className="family-label">Products</p>
            <h1 className="np-hero" id="products-title">One platform. Distinct operating environments.</h1>
          </div>
          <div className="family-hero-copy">
            <p>Explore Neptlium's product families. Portfolio, Investments, Allocation and Intelligence are connected capabilities, not separate product companies.</p>
          </div>
        </section>
        <section className="family-grid" aria-label="Neptlium product families">
          {PRODUCTS.map((product) => (
            <article className="family-card" key={product.href}>
              <span>Product family</span>
              <h2>{product.label}</h2>
              <p>{product.description}</p>
              <Link href={product.href}>Explore {product.label}<ArrowRight aria-hidden="true" /></Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
