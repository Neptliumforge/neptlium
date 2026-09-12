import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CinematicScrollStory } from '@/components/cinematic-scroll-story';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital operating infrastructure',
  description: 'Neptlium connects capital state, operating context, and governed work so financial information remains intelligible before consequence.',
  path: '/',
});

const products = [
  { eyebrow: 'Capital Account', title: 'Your capital, in one place.', body: 'Give funding, availability and movement a durable operating context without confusing visibility with authority.', image: '/marketing/capital-account.webp', href: '/products/capital-account', tone: 'carbon' },
  { eyebrow: 'Treasury', title: 'Capital readiness, made visible.', body: 'Read liquidity, reserves, obligations and readiness against the wider capital system around them.', image: '/marketing/treasury.webp', href: '/products/treasury', tone: 'marine' },
  { eyebrow: 'Allocation', title: 'From insight to intention.', body: 'Model target states, constraints and review while keeping proposed structure distinct from financial consequence.', image: '/marketing/allocation.webp', href: '/products/allocation', tone: 'stone' },
  { eyebrow: 'Portfolio Intelligence', title: 'See the companies behind the capital.', body: 'Interpret ownership, exposure, concentration and relationships as one connected capital system.', image: '/marketing/company-intelligence.webp', href: '/products/portfolio-intelligence', tone: 'navy' },
] as const;

export default function HomePage() {
  return (
    <div className="cin-home">
      <section className="cin-hero" aria-labelledby="cin-hero-title">
        <div className="cin-hero-copy">
          <p className="cin-kicker">Capital operating infrastructure</p>
          <h1 id="cin-hero-title">Capital should remain intelligible as it moves.</h1>
          <p>Neptlium connects capital state, operating context, and governed work so evidence, intent, authority, and consequence remain distinct.</p>
          <div className="cin-actions">
            <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
            <Link className="cin-text-link" href="#operating-story">See the operating model</Link>
          </div>
        </div>
        <figure className="cin-hero-object">
          <img src="/marketing/overview.webp" alt="Illustrative Neptlium capital operating environment represented as layered financial planes" />
          <figcaption>Illustrative Neptlium operating environment</figcaption>
        </figure>
      </section>

      <div id="operating-story"><CinematicScrollStory /></div>

      <section className="cin-products" aria-labelledby="cin-products-title">
        <header className="cin-section-head">
          <p className="cin-kicker">Connected products</p>
          <h2 id="cin-products-title">One operating environment. Four distinct responsibilities.</h2>
        </header>
        <div className="cin-product-scenes">
          {products.map((product, index) => (
            <article className={`cin-product-scene cin-scene-${product.tone}`} key={product.eyebrow}>
              <div className="cin-product-scene-copy">
                <span>0{index + 1}</span>
                <p className="cin-kicker">{product.eyebrow}</p>
                <h3>{product.title}</h3>
                <p>{product.body}</p>
                <Link href={product.href}>Explore {product.eyebrow}<ArrowRight aria-hidden="true" /></Link>
              </div>
              <figure>
                <img src={product.image} alt={`Illustrative Neptlium ${product.eyebrow} product interface concept`} />
                <figcaption>Illustrative interface concept. Values shown are fictional examples.</figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section className="cin-intelligence">
        <div><p className="cin-kicker">Institutional intelligence</p><h2>More context. Less ambiguity.</h2></div>
        <p>Capital becomes easier to govern when ownership, liquidity, intent, evidence and operating constraints can be understood together without collapsing their different meanings.</p>
      </section>

      <section className="cin-trust" aria-labelledby="cin-trust-title">
        <p className="cin-kicker">Clarity before consequence</p>
        <h2 id="cin-trust-title">The system should never claim more than the evidence supports.</h2>
        <div className="cin-lifecycle" aria-label="Neptlium governed financial state lifecycle">
          {['Observed', 'Modeled', 'Reviewed', 'Authorized', 'Consequential'].map((item, index) => <span key={item}>{item}{index < 4 ? <i>→</i> : null}</span>)}
        </div>
        <p>Motion represents changes in meaning and authority—not fabricated financial execution.</p>
      </section>
    </div>
  );
}
