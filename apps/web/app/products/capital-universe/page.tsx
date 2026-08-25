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
    <div className="product-story capital-universe-story">
      <section className="universe-hero">
        <div className="web-shell universe-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Products · Capital Universe</p>
            <h1>Classify capital by purpose before reducing it to an asset list.</h1>
          </div>
          <p>
            Capital Universe is a strategic language for understanding how pools of capital relate to
            an operating objective across asset classes. It does not establish asset, network, custody,
            market or execution availability.
          </p>
        </div>
      </section>

      <section className="universe-role-field" aria-labelledby="universe-role-title">
        <div className="web-shell">
          <div className="universe-role-heading">
            <p className="web-eyebrow on-light">Capital roles</p>
            <h2 id="universe-role-title">A role explains why capital exists in the system.</h2>
          </div>
          <div className="universe-role-map">
            {roles.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="universe-boundary">
        <div className="web-shell universe-boundary-grid">
          <p className="web-eyebrow on-light">Availability boundary</p>
          <div>
            <h2>Classification is not availability.</h2>
            <p>
              A capital role can remain useful even when the underlying instrument, network, provider
              or venue changes. Strategic taxonomy should not become a disguised catalogue of supported assets.
            </p>
          </div>
        </div>
      </section>

      <section className="universe-provider-independent architecture-dark">
        <div className="web-shell universe-provider-grid">
          <h2>Capital identity should remain useful as infrastructure changes.</h2>
          <div>
            <p>
              The operating model is designed to evolve without rebuilding its meaning around a single
              provider, blockchain, execution venue or asset class.
            </p>
            <Link className="text-arrow-link on-dark" href="/products/allocation">
              See roles in Allocation <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
