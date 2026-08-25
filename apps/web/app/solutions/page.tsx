import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SOLUTIONS } from '@/lib/content/public-architecture';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Solutions — Capital Operating Problems Neptlium Addresses',
  description:
    'See Neptlium through the operating problems it is designed to address: capital visibility, treasury coordination, allocation workflows and governance.',
  path: '/solutions',
});

const solutionDetails = [
  {
    id: 'capital-visibility',
    title: 'Capital visibility',
    question: 'How do we understand the whole capital picture without flattening its meaning?',
    body: 'Keep portfolio composition, account activity, liquidity and capital roles connected while preserving the difference between visible context and authoritative financial state.',
    links: [
      ['Portfolio Intelligence', '/products/portfolio-intelligence'],
      ['Capital Account', '/products/capital-account'],
    ],
  },
  {
    id: 'treasury-coordination',
    title: 'Treasury coordination',
    question: 'How do we keep liquidity useful to the decisions around it?',
    body: 'Bring treasury context into the same operating model as portfolio and allocation work so reserves, readiness and movement remain understandable together.',
    links: [
      ['Treasury', '/products/treasury'],
      ['Capital Account', '/products/capital-account'],
    ],
  },
  {
    id: 'allocation-workflows',
    title: 'Allocation workflows',
    question: 'How do we shape a plan without making intent look like execution?',
    body: 'Express capital roles, model a possible structure, review the proposal and keep the boundary between planning, authority and financial outcome explicit.',
    links: [
      ['Allocation', '/products/allocation'],
      ['Capital Universe', '/products/capital-universe'],
    ],
  },
  {
    id: 'governance-control',
    title: 'Governance and control',
    question: 'How do we make consequential work understandable before it becomes irreversible?',
    body: 'Keep identity, authorization, review, operating state and auditability visible around important capital decisions rather than hiding them behind a single action.',
    links: [
      ['Security', '/security'],
      ['Trust', '/trust'],
    ],
  },
] as const;

export default function SolutionsPage() {
  return (
    <div className="architecture-page solutions-hub">
      <section className="architecture-hero">
        <div className="web-shell architecture-hero-grid">
          <div>
            <p className="web-eyebrow on-light">Solutions</p>
            <h1>Start with the operating problem, not a feature list.</h1>
          </div>
          <p className="architecture-lead">
            Neptlium is designed for situations where capital becomes difficult to understand because
            context, liquidity, movement, allocation and authority are split across different tools or
            conversations.
          </p>
        </div>
      </section>

      <section className="architecture-section architecture-compact" aria-label="Solution index">
        <div className="web-shell solution-index">
          {SOLUTIONS.map((solution, index) => (
            <a href={solution.href} key={solution.href}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{solution.label}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="architecture-section solutions-detail" aria-labelledby="solutions-title">
        <div className="web-shell">
          <div className="architecture-section-heading">
            <p className="web-eyebrow on-light">Operating needs</p>
            <h2 id="solutions-title">Four problems. One connected operating model.</h2>
          </div>
          <div className="solution-essays">
            {solutionDetails.map((solution, index) => (
              <article id={solution.id} key={solution.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="solution-label">{solution.title}</p>
                  <h3>{solution.question}</h3>
                  <p>{solution.body}</p>
                  <div className="inline-links">
                    {solution.links.map(([label, href]) => (
                      <Link href={href} key={href}>
                        {label} <ArrowRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="architecture-cta architecture-dark">
        <div className="web-shell architecture-cta-inner">
          <div>
            <p className="web-eyebrow">System view</p>
            <h2>See how those operating needs resolve into one platform architecture.</h2>
          </div>
          <Link className="web-button secondary" href="/platform">
            Explore platform <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
