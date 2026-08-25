import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Universe — Neptlium Products',
  description:
    'Explore the Neptlium capital-universe model for organizing capital roles across asset classes without implying unsupported asset, market or execution availability.',
  path: '/products/capital-universe',
});

const roles = [
  ['Reserve', 'Capital intentionally preserved for resilience or defined obligations.'],
  ['Core', 'Capital organized around durable strategic exposure.'],
  ['Growth', 'Capital assigned to a longer-horizon growth objective.'],
  ['Opportunity', 'Capital reserved for deliberate, bounded opportunity contexts.'],
  ['Restricted', 'Capital whose use remains constrained by policy, state or other verified limits.'],
] as const;

export default function CapitalUniversePage() {
  return (
    <div className="architecture-page product-deep-page">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Capital Universe</p>
            <h1>Organize capital by role before reducing it to an asset list.</h1>
          </div>
          <p className="architecture-lead">
            Capital Universe is the Neptlium model for understanding how different pools of capital can
            relate to an operating objective across asset classes. Strategic architecture does not
            establish asset, network, custody, market or execution availability.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="capital-roles-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">Capital roles</p>
            <h2 id="capital-roles-title">A stable language can outlast any one provider or asset class.</h2>
            <p>
              Roles describe why capital exists in the operating model. They are not promises that a
              particular instrument, venue, network or provider is available.
            </p>
          </div>
          <div className="architecture-numbered-list">
            {roles.map(([title, body], index) => (
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

      <section className="architecture-section architecture-dark">
        <div className="web-shell architecture-statement">
          <p className="web-eyebrow">Provider-independent principle</p>
          <h2>Capital identity should remain useful as infrastructure changes.</h2>
          <p>
            Neptlium is designed so the operating model can evolve without rebuilding its meaning around
            a single provider, blockchain, execution venue or asset class.
          </p>
        </div>
      </section>

      <section className="architecture-cta">
        <div className="web-shell architecture-cta-inner">
          <h2>See how capital roles connect to allocation decisions.</h2>
          <Link className="web-button primary" href="/products/allocation">
            Explore Allocation <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
