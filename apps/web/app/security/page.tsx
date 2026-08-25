import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SecurityFlowVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Security and Control Architecture',
  description:
    'Explore Neptlium’s public security principles for identity, authorization, server-side privilege, data boundaries, idempotency, auditability and fail-closed behavior.',
  path: '/security',
});

const controlBoundaries = [
  ['Identity', 'Authentication establishes who is present; it does not by itself authorize a consequential operation.'],
  ['Authority', 'Roles, ownership, policy and resource state remain server-enforced boundaries.'],
  ['Privilege', 'Provider secrets, service credentials and privileged commands stay outside public browser authority.'],
  ['Evidence', 'Operational transitions should remain attributable and reviewable rather than inferred from presentation state.'],
] as const;

export default function SecurityPage() {
  return (
    <div className="security-architecture-page">
      <section className="security-hero architecture-dark">
        <div className="web-shell security-hero-grid">
          <div>
            <p className="web-eyebrow">Security</p>
            <h1>Control is part of the operating architecture.</h1>
          </div>
          <p>
            Neptlium separates identity, authorization, privileged operations, financial state and
            provider evidence. These are architectural principles, not claims of certification,
            insurance, regulatory approval or perfect security.
          </p>
        </div>
      </section>

      <section className="security-control-map" aria-labelledby="security-boundaries-title">
        <div className="web-shell security-control-grid">
          <div>
            <p className="web-eyebrow on-light">Control boundaries</p>
            <h2 id="security-boundaries-title">A consequential action crosses more than one boundary.</h2>
            <div className="product-story-visual security-primary-visual"><SecurityFlowVisual /></div>
          </div>
          <div className="security-boundary-list">
            {controlBoundaries.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="security-principles">
        <div className="web-shell security-principles-grid">
          <article>
            <h2>Fail closed</h2>
            <p>Missing credentials, unavailable dependencies or unverified capability must not become simulated success.</p>
          </article>
          <article>
            <h2>Replay resistance</h2>
            <p>Consequential operations are designed to resist accidental duplication and unsafe replay.</p>
          </article>
          <article>
            <h2>Data boundaries</h2>
            <p>Ownership, row-level controls and service boundaries constrain access according to the responsible subsystem.</p>
          </article>
        </div>
      </section>

      <section className="security-close architecture-dark">
        <div className="web-shell product-story-close-grid">
          <h2>Security describes controls. Trust describes how those controls are communicated.</h2>
          <Link className="text-arrow-link on-dark" href="/trust">
            Continue to Trust <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
