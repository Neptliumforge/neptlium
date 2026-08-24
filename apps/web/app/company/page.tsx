import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Company and Operating Principles',
  description:
    'Learn the operating principles behind Neptlium: truthful presentation, explicit control, capital context, liquidity discipline and security by design.',
  path: '/company',
});

const principles = [
  ['Truthful presentation', 'Capabilities, risks, uncertainty and availability should be communicated without manufactured certainty.'],
  ['Explicit control', 'Consequential decisions should remain understandable, attributable and intentional.'],
  ['Capital context', 'Portfolio, treasury and allocation decisions are more useful when their operating context remains connected.'],
  ['Liquidity discipline', 'Observed, reserved, available and operationally ready capital are not interchangeable states.'],
  ['Security by design', 'Identity, authorization, server privilege and auditability are architectural boundaries rather than decorative trust language.'],
] as const;

export default function CompanyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Building infrastructure for a more coherent capital operating model."
        intro="Neptlium is building a capital operating platform around clarity, deliberate authority and durable financial state—not constant transaction activity."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Company' }]}
      />
      <Section>
        <div className="route-split">
          <div>
            <h2>Modern capital needs more than disconnected views and execution endpoints.</h2>
          </div>
          <p>
            Portfolio context, capital operations, treasury and allocation belong in one operating
            environment while identity, authorization, provider evidence and canonical financial state
            retain their proper boundaries.
          </p>
        </div>
      </Section>
      <Section tone="surface">
        <div id="principles" className="principles-editorial">
          <h2>Principles that shape Neptlium.</h2>
          <div>
            {principles.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="route-action">
          <Link className="button" href="/contact">
            Contact Neptlium
          </Link>
          <Link href="/about">Read the Neptlium thesis</Link>
        </div>
      </Section>
    </>
  );
}
