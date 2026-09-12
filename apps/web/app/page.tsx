import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CinematicScrollStory } from '@/components/cinematic-scroll-story';
import { SITE } from '@/lib/content/site';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital operating infrastructure',
  description: 'Neptlium brings ownership, liquidity, intent and governed action into one operating environment.',
  path: '/',
});

const products = [
  { name:'Capital Account', title:'See capital before you act on it.', body:'Understand available capital, funding and movement without losing the context behind the number.', image:'/marketing/capital-account.webp', href:'/products/capital-account', tone:'carbon' },
  { name:'Treasury', title:'Know what is available. Know what is required.', body:'Read liquidity, obligations and funding requirements in the same operating context.', image:'/marketing/treasury.webp', href:'/products/treasury', tone:'marine' },
  { name:'Allocation', title:'Move from insight to intention.', body:'Model what should change without pretending that the change has already happened.', image:'/marketing/allocation.webp', href:'/products/allocation', tone:'stone' },
  { name:'Portfolio Intelligence', title:'See the companies behind the capital.', body:'Understand ownership, exposure, concentration and relationships as one connected system.', image:'/marketing/company-intelligence.webp', href:'/products/portfolio-intelligence', tone:'navy' },
] as const;

export default function HomePage() {
  return (
    <div className="marketing-home">
      <section className="marketing-hero" aria-labelledby="home-title">
        <div className="marketing-hero-surface" aria-hidden="true"><span/><span/><span/></div>
        <div className="marketing-hero-copy">
          <h1 id="home-title"><span>Capital should remain</span><span>intelligible as it moves.</span></h1>
          <p>Neptlium brings ownership, liquidity, intent and governed action into one operating environment—so you can understand what you own, what it means, and what may happen next.</p>
          <div className="marketing-actions">
            <Link className="cin-pill cin-pill-light" href={SITE.publicAccessUrl}>{SITE.publicAccessLabel}<ArrowRight aria-hidden="true" /></Link>
            <Link className="marketing-text-link" href="#operating-model">See how Neptlium works</Link>
          </div>
        </div>
      </section>

      <div id="operating-model"><CinematicScrollStory /></div>

      <section className="product-story" aria-labelledby="product-story-title">
        <div className="product-story-intro"><h2 id="product-story-title">Four responsibilities. One capital environment.</h2></div>
        {products.map((product) => (
          <article className={`product-story-scene product-story-${product.tone}`} key={product.name}>
            <div className="product-story-copy">
              <p>{product.name}</p>
              <h3>{product.title}</h3>
              <span>{product.body}</span>
              <Link href={product.href}>Explore {product.name}<ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="product-story-image"><img src={product.image} alt={`Neptlium ${product.name}`} /></div>
          </article>
        ))}
      </section>

      <section className="institutional-proof">
        <div className="institutional-proof-head"><h2>Built for capital that has become too important for fragmented tools.</h2></div>
        <div className="institutional-proof-grid">
          <article><h3>One source of operating context.</h3><p>Bring ownership, liquidity and decision context into view without flattening their different meanings.</p></article>
          <article><h3>Clear boundaries of authority.</h3><p>A model, recommendation, approval and financial consequence should never look identical.</p></article>
          <article><h3>Intelligence attached to evidence.</h3><p>Know what the system knows, where it came from, and where interpretation begins.</p></article>
        </div>
      </section>

      <section className="governance-cinema">
        <div><p>Clarity before consequence.</p><h2>Know what the system knows. Know what it can do.</h2></div>
        <div className="governance-sequence">{['Observed','Modeled','Reviewed','Authorized','Consequential'].map((item, index)=><span key={item}>{item}{index<4?<i>→</i>:null}</span>)}</div>
      </section>
    </div>
  );
}
