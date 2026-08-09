import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Section } from '@/components/section';

export const metadata: Metadata = {
  title: 'About Neptlium',
  description: 'The thesis behind Neptlium capital operating infrastructure.',
  alternates: { canonical: '/about' },
};

const values = [
  ['Structure over activity', 'Capital is served by organization and clarity, not constant activity.'],
  ['Visibility over noise', 'A connected view supports better judgment than fragmented tools.'],
  ['Discipline over speculation', 'Modeling, review and authorization keep decisions deliberate.'],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Capital, organized for long-term ownership."
        intro="Neptlium brings portfolio context, account infrastructure and capital decisions into one controlled system."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />
      <Section tone="surface">
        <div className="route-split">
          <div><h2>Designed around capital, not transactions.</h2></div>
          <div className="route-rows compact">
            {values.map(([title, body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}
          </div>
        </div>
      </Section>
      <Section>
        <div className="route-action"><Link className="button" href="/company#principles">Read our principles</Link><Link href="/contact">Contact Neptlium</Link></div>
      </Section>
    </>
  );
}
