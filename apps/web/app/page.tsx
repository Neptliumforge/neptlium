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
  { name: 'Capital Account', title: 'Your capital, in one place.', body: 'Give funding, availability and movement a durable operating context without confusing visibility with authority.', image: '/marketing/capital-account.webp', href: '/products/capital-account', tone: 'carbon' },
  { name: 'Treasury', title: 'Capital readiness, made visible.', body: 'Read liquidity, reserves, obligations and readiness against the wider capital system around them.', image: '/marketing/treasury.webp', href: '/products/treasury', tone: 'marine' },
  { name: 'Allocation', title: 'From insight to intention.', body: 'Model target states, constraints and review while keeping proposed structure distinct from financial consequence.', image: '/marketing/allocation.webp', href: '/products/allocation', tone: 'stone' },
  { name: 'Portfolio Intelligence', title: 'See the companies behind the capital.', body: 'Interpret ownership, exposure, concentration and relationships as one connected capital system.', image: '/marketing/company-intelligence.webp', href: '/products/portfolio-intelligence', tone: 'navy' },
] as const;

export default function HomePage() {
  return (
    <div className="cin-home refined-home">
      <section className="cin-hero refined-hero" aria-labelledby="cin-hero-title">
        <div className="refined-hero-ambient" aria-hidden="true" />
        <div className="cin-hero-copy refined-hero-copy">
          <h1 id="cin-hero-title">Capital should remain intelligible as it moves.</h1>
          <p>Neptlium connects capital state, operating context, and governed work so evidence, intent, authority, and consequence remain distinct.</p>
          <div className="cin-actions refined-hero-actions">
            <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
            <Link className="refined-operating-link" href="#operating-story">See the operating model</Link>
          </div>
        </div>
      </section>

      <div id="operating-story"><CinematicScrollStory /></div>

      <section className="cin-products refined-products" aria-labelledby="cin-products-title">
        <header className="cin-section-head refined-section-head">
          <h2 id="cin-products-title">One operating environment. Four distinct responsibilities.</h2>
        </header>
        <div className="cin-product-scenes">
          {products.map((product) => (
            <article className={`cin-product-scene cin-scene-${product.tone}`} key={product.name}>
              <div className="cin-product-scene-copy refined-product-copy">
                <p className="refined-product-name">{product.name}</p>
                <h3>{product.title}</h3>
                <p>{product.body}</p>
                <Link href={product.href}>Explore {product.name}<ArrowRight aria-hidden="true" /></Link>
              </div>
              <figure><img src={product.image} alt={`Neptlium ${product.name} interface concept`} /></figure>
            </article>
          ))}
        </div>
      </section>

      <section className="cin-intelligence refined-intelligence">
        <div><h2>More context. Less ambiguity.</h2></div>
        <p>Capital becomes easier to govern when ownership, liquidity, intent, evidence and operating constraints can be understood together without collapsing their different meanings.</p>
      </section>

      <section className="cin-trust refined-trust" aria-labelledby="cin-trust-title">
        <h2 id="cin-trust-title">Clarity before consequence.</h2>
        <p className="refined-trust-lead">The system should never claim more than the evidence supports.</p>
        <div className="cin-lifecycle" aria-label="Neptlium governed financial state lifecycle">
          {['Observed', 'Modeled', 'Reviewed', 'Authorized', 'Consequential'].map((item, index) => <span key={item}>{item}{index < 4 ? <i>→</i> : null}</span>)}
        </div>
        <p>Motion represents changes in meaning and authority—not fabricated financial execution.</p>
      </section>
    </div>
  );
}
