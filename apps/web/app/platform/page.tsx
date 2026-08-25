import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Platform — Neptlium Capital Operating Environment',
  description:
    'Understand Neptlium as a unified capital operating environment connecting visibility, organization, intelligence, governance and product relationships.',
  path: '/platform',
});

const lifecycle = [
  ['Understand', 'Bring portfolio, account and treasury context into view.'],
  ['Organize', 'Give capital roles, movement and operating state a coherent structure.'],
  ['Shape', 'Model allocation intent before it becomes consequential.'],
  ['Review', 'Keep authority and control visible around important decisions.'],
  ['Interpret', 'Return outcomes and operating context to the wider capital picture.'],
] as const;

const principles = [
  ['Connected context', 'Products remain distinct while sharing a common operating picture.'],
  ['Explicit boundaries', 'Visibility, modeling, authorization and outcome keep their different meanings.'],
  ['Provider independence', 'The product model is not defined by one external provider, network or venue.'],
  ['Truthful state', 'Unknown, unavailable, observed and authoritative information are not interchangeable.'],
] as const;

export default function PlatformPage() {
  return (
    <div className="architecture-page platform-hub">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Platform</p>
            <h1>A capital operating environment, not a collection of disconnected tools.</h1>
          </div>
          <p className="architecture-lead">
            Neptlium connects capital context, movement, liquidity, allocation and intelligence through
            one operating model while preserving the boundaries that keep consequential state legible.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="platform-model-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">System model</p>
            <h2 id="platform-model-title">One picture. Different responsibilities.</h2>
            <p>
              Platform explains the relationships between Neptlium products. Products explains what each
              component does. Solutions explains the operating problems those components address.
            </p>
          </div>
          <div className="platform-map" aria-label="Neptlium platform relationship model">
            {PRODUCTS.slice(0, 4).map((product, index) => (
              <div key={product.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{product.label}</strong>
                <p>{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="architecture-section architecture-dark" aria-labelledby="lifecycle-title">
        <div className="web-shell">
          <div className="architecture-section-heading">
            <p className="web-eyebrow">Operating lifecycle</p>
            <h2 id="lifecycle-title">Capital moves through understanding before consequence.</h2>
          </div>
          <ol className="platform-lifecycle">
            {lifecycle.map(([title, body], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="platform-principles-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">Architectural principles</p>
            <h2 id="platform-principles-title">The system is designed around meaning, not surface similarity.</h2>
          </div>
          <div className="architecture-numbered-list">
            {principles.map(([title, body], index) => (
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

      <section className="architecture-cta architecture-dark">
        <div className="web-shell architecture-cta-inner">
          <div>
            <p className="web-eyebrow">Product family</p>
            <h2>See the components that make the system concrete.</h2>
          </div>
          <Link className="web-button secondary" href="/products">
            Explore products <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
