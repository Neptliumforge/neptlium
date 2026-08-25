import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operations Concepts and Definitions',
  description:
    'Learn the concepts behind capital accounts, portfolio context, treasury, allocation, authorization and financial state without confusing product direction with live availability.',
  path: '/learn',
});

const concepts = [
  ['Capital Account', 'The operating context in which capital, account state and controlled movement can be represented.'],
  ['Portfolio', 'A connected view of composition and portfolio context without assuming every visible value is authoritative.'],
  ['Treasury', 'The relationship between observed capital, reserves, availability and operational readiness.'],
  ['Allocation', 'A governed process for expressing and reviewing how capital could be assigned to defined roles.'],
  ['Modeling', 'A modeled result describes a possible structure. It does not move capital.'],
  ['Authorization', 'The policy and identity boundary required before a consequential action may proceed.'],
  ['Settlement', 'Submission and processing do not become settled or reconciled state without the required evidence.'],
] as const;

export default function LearnPage() {
  return (
    <div className="learn-editorial-page">
      <section className="learn-editorial-hero">
        <div className="web-shell learn-editorial-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Learn</p>
            <h1>Understand the operating language before the interface.</h1>
          </div>
          <p>
            A clear capital vocabulary helps distinguish what is observed, what is modeled, what is
            authorized and what has actually happened.
          </p>
        </div>
      </section>

      <section className="learn-definition-ledger" aria-labelledby="learn-definitions-title">
        <div className="web-shell">
          <div className="learn-definition-heading">
            <span>Foundations</span>
            <h2 id="learn-definitions-title">Seven concepts that keep capital state legible.</h2>
          </div>
          <dl>
            {concepts.map(([term, definition], index) => (
              <div key={term}>
                <dt><span>{String(index + 1).padStart(2, '0')}</span>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="learn-principle architecture-dark">
        <div className="web-shell learn-principle-grid">
          <p className="web-eyebrow">Working principle</p>
          <div>
            <h2>Visible does not mean authoritative. Modeled does not mean executed.</h2>
            <p>
              Neptlium uses those distinctions to keep useful product context from manufacturing
              certainty where the underlying evidence does not support it.
            </p>
          </div>
        </div>
      </section>

      <section className="learn-paths">
        <div className="web-shell learn-paths-grid">
          <div><h2>Continue from concept to system.</h2></div>
          <div className="inline-links">
            <Link href="/platform">Platform</Link>
            <Link href="/products">Products</Link>
            <Link href="/resources">Resources</Link>
          </div>
          <Link className="text-arrow-link" href="/platform">
            Explore the operating model <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
