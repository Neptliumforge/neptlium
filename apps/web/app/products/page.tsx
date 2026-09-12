import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Products — Capital Operating Architecture | Neptlium',
  description: 'Explore Neptlium Capital Account, Treasury, Allocation and Portfolio Intelligence as connected responsibilities within one capital operating environment.',
  path: '/products',
});

const products = [
  { eyebrow: 'Capital Account', title: 'Your capital, in one place.', body: 'Give funding, availability and movement a durable operating context without confusing visibility with authority.', image: '/marketing/capital-account.webp', href: '/products/capital-account', tone: 'carbon' },
  { eyebrow: 'Treasury', title: 'Liquidity, under control.', body: 'Read reserves, obligations, liquidity and readiness against the wider capital system around them.', image: '/marketing/treasury.webp', href: '/products/treasury', tone: 'marine' },
  { eyebrow: 'Allocation', title: 'From insight to intention.', body: 'Model target states, constraints and review while keeping proposed structure distinct from financial consequence.', image: '/marketing/allocation.webp', href: '/products/allocation', tone: 'stone' },
  { eyebrow: 'Portfolio Intelligence', title: 'See the companies behind the capital.', body: 'Interpret ownership, exposure, concentration and relationships as one connected capital system.', image: '/marketing/company-intelligence.webp', href: '/products/portfolio-intelligence', tone: 'navy' },
] as const;

export default function ProductsPage() {
  return (
    <div className="cin-home">
      <section className="cin-product-thesis" aria-labelledby="products-title">
        <p className="cin-kicker">Products</p>
        <h1 id="products-title">Four responsibilities. One operating environment.</h1>
      </section>

      <section className="cin-products" aria-label="Neptlium product family">
        <div className="cin-product-scenes">
          {products.map((product, index) => (
            <article className={`cin-product-scene cin-scene-${product.tone}`} key={product.eyebrow}>
              <div className="cin-product-scene-copy">
                <span>0{index + 1}</span>
                <p className="cin-kicker">{product.eyebrow}</p>
                <h2>{product.title}</h2>
                <p>{product.body}</p>
                <Link href={product.href}>Explore {product.eyebrow}<ArrowRight aria-hidden="true" /></Link>
              </div>
              <figure>
                <img src={product.image} alt={`Illustrative Neptlium ${product.eyebrow} interface concept`} />
                <figcaption>Illustrative interface concept. Values shown are fictional examples.</figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section className="cin-intelligence">
        <div><p className="cin-kicker">Connected responsibility</p><h2>Context should survive every handoff.</h2></div>
        <p>Account context can inform treasury, treasury can constrain allocation, and portfolio intelligence can interpret the result while each surface preserves its own evidence, lifecycle and authority boundaries.</p>
      </section>
    </div>
  );
}
