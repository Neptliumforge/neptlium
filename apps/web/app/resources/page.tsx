import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RESOURCES } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Resources — Learn, Security, Trust and Research',
  description:
    'Explore Neptlium learning material, security principles, trust boundaries and the research publication surface.',
  path: '/resources',
});

const resourceRoles = [
  ['Learn', 'Education', 'Concepts, terminology and operating relationships that help explain how Neptlium thinks about capital work.'],
  ['Security', 'Architecture principles', 'How identity, authorization, server-side privilege, data boundaries and fail-closed behavior fit together.'],
  ['Trust', 'Boundaries and risk', 'How Neptlium communicates product truth, uncertainty, control and risk without presenting principles as certifications.'],
  ['Research', 'Publication surface', 'A reserved home for substantive, dated Neptlium research. It remains non-indexable until real publications exist.'],
] as const;

export default function ResourcesPage() {
  return (
    <div className="architecture-page resources-hub">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Resources</p>
            <h1>Understand the ideas and boundaries behind the product.</h1>
          </div>
          <p className="architecture-lead">
            Resources separates product education, security architecture, trust communication and
            original research so each can earn the level of authority its content supports.
          </p>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="resource-roles-title">
        <div className="web-shell">
          <div className="architecture-section-heading">
            <p className="web-eyebrow on-light">Resource roles</p>
            <h2 id="resource-roles-title">Different questions need different kinds of authority.</h2>
          </div>
          <div className="resource-ledger">
            {resourceRoles.map(([title, role, body], index) => {
              const destination = RESOURCES.find((resource) => resource.label === title);
              if (!destination) return null;
              return (
                <Link href={destination.href} key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <small>{role}</small>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="architecture-section architecture-dark">
        <div className="web-shell architecture-split">
          <div>
            <p className="web-eyebrow">Publishing discipline</p>
            <h2>Empty space is better than manufactured authority.</h2>
          </div>
          <div className="architecture-prose">
            <p>
              Neptlium will not invent articles, research findings, certifications or press coverage to
              make a resource library appear mature before the underlying material exists.
            </p>
            <p>
              Learn, Security and Trust can explain durable concepts today. Research remains a truthful
              publication surface until substantive, dated work is available.
            </p>
          </div>
        </div>
      </section>

      <section className="architecture-cta">
        <div className="web-shell architecture-cta-inner">
          <h2>Start with the operating vocabulary.</h2>
          <Link className="web-button primary" href="/learn">
            Explore Learn <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
