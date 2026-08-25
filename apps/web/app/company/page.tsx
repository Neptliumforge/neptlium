import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COMPANY } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Company — Neptlium',
  description:
    'Understand the organization, product thesis and operating principles behind Neptlium, with direct paths to About, Contact and verified press information.',
  path: '/company',
});

const principles = [
  ['Truthful presentation', 'Capabilities, risks, uncertainty and availability should be communicated without manufactured certainty.'],
  ['Explicit control', 'Consequential decisions should remain understandable, attributable and intentional.'],
  ['Capital context', 'Portfolio, treasury and allocation decisions become more useful when their relationships remain visible.'],
  ['Security by design', 'Identity, authorization, server privilege and auditability are architectural boundaries rather than decorative trust language.'],
] as const;

export default function CompanyPage() {
  return (
    <div className="architecture-page company-hub">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Company</p>
            <h1>Building a clearer operating model for complex capital.</h1>
          </div>
          <p className="architecture-lead">
            Neptlium is building a capital operating platform around context, deliberate authority and
            durable product meaning rather than transaction theatre or manufactured certainty.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="company-principles-title">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow on-light">Operating principles</p>
            <h2 id="company-principles-title">The company should communicate with the same discipline as the product.</h2>
          </div>
          <div className="architecture-numbered-list" id="principles">
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

      <section className="architecture-section architecture-dark" aria-labelledby="company-destinations-title">
        <div className="web-shell">
          <div className="architecture-section-heading">
            <p className="web-eyebrow">Company information</p>
            <h2 id="company-destinations-title">Go deeper only where there is something real to say.</h2>
          </div>
          <div className="architecture-link-list dark-links">
            {COMPANY.map((destination, index) => (
              <Link href={destination.href} key={destination.href}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{destination.label}</h3>
                  <p>{destination.description}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="architecture-cta">
        <div className="web-shell architecture-cta-inner">
          <h2>Read why Neptlium exists.</h2>
          <Link className="web-button primary" href="/about">
            About Neptlium <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
