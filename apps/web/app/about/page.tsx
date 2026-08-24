import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'About Neptlium and the Capital Operating Thesis',
  description:
    'Learn why Neptlium is building a capital operating platform around context, disciplined authority and institutional clarity.',
  path: '/about',
});

const values = [
  ['Structure over activity', 'Capital is better served by organization, context and deliberate control than by constant transaction activity.'],
  ['Visibility with provenance', 'A connected view is useful only when observed, modeled, unknown and authoritative values remain distinguishable.'],
  ['Discipline over speculation', 'Modeling, review and authorization keep proposed decisions separate from actual financial execution.'],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Neptlium"
        title="Capital, organized for deliberate operation."
        intro="Neptlium is building a capital operating platform that connects portfolio context, capital operations, treasury and allocation without erasing the boundaries that make financial state trustworthy."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />
      <Section tone="surface">
        <div className="route-split">
          <div>
            <h2>Designed around capital context, not transaction volume.</h2>
          </div>
          <div className="route-rows compact">
            {values.map(([title, body]) => (
              <article key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="route-action">
          <Link className="button" href="/company#principles">
            Read our principles
          </Link>
          <Link href="/contact">Contact Neptlium</Link>
        </div>
      </Section>
    </>
  );
}
