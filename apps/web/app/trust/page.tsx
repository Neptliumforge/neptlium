import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Trust — Product Truth, Boundaries and Risk',
  description:
    'Understand how Neptlium approaches product truth, uncertainty, privacy boundaries, risk communication and explicit control without turning principles into certifications.',
  path: '/trust',
});

const trustPrinciples = [
  ['Product truth', 'Strategic product direction, configured infrastructure and live capability are not presented as interchangeable facts.'],
  ['Explicit uncertainty', 'Unknown, unavailable and incomplete information should remain understandable rather than being filled with invented certainty.'],
  ['Control boundaries', 'Identity, authorization, review and consequential action remain distinct responsibilities.'],
  ['Privacy boundaries', 'Access to user and account information belongs inside defined ownership and authorization controls.'],
  ['Risk communication', 'Product, market and infrastructure risk should be described plainly without implying guarantees.'],
] as const;

export default function TrustPage() {
  return (
    <div className="architecture-page trust-page">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Resources · Trust</p>
            <h1>Trust starts with saying exactly what the system knows — and what it does not.</h1>
          </div>
          <p className="architecture-lead">
            Neptlium treats trust as a product and communication discipline. Architecture principles are
            not presented as certifications, insurance, regulatory approvals or guarantees of perfect
            security.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="trust-principles-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">Trust model</p>
            <h2 id="trust-principles-title">Make important boundaries visible before they become consequential.</h2>
          </div>
          <div className="architecture-numbered-list">
            {trustPrinciples.map(([title, body], index) => (
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
          <p className="web-eyebrow">Security relationship</p>
          <h2>Trust explains the promise. Security explains the control architecture behind it.</h2>
          <p>
            The two pages are intentionally related but not interchangeable: Trust covers communication,
            boundaries and risk; Security covers identity, authorization, privileged operations and
            fail-closed architecture principles.
          </p>
          <Link className="text-arrow-link on-dark" href="/security">
            Explore Security <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
