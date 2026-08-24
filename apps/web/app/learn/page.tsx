import { FoundationPage } from '@/components/foundation-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operations Concepts and Definitions',
  description:
    'Learn the concepts behind capital accounts, portfolio context, treasury, allocation, authorization and financial state without confusing product direction with live availability.',
  path: '/learn',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Learn"
      title="Understand the operating model before the interface."
      intro="A clear capital vocabulary helps distinguish what is observed, what is modeled, what is authorized and what has actually happened."
      anchors={['Foundations', 'Concepts', 'Platform']}
      lead={[
        'A practical vocabulary for capital operations.',
        'Neptlium separates capital context, intent, authority and execution so that a useful interface does not erase the meaning of financial state.',
      ]}
      cards={[
        ['Capital Account', 'The operating context in which capital, account state and controlled movement can be represented.'],
        ['Portfolio', 'A connected view of composition and portfolio context without assuming every visible value is authoritative.'],
        ['Treasury', 'The relationship between observed capital, reserves, availability and operational readiness.'],
        ['Allocation', 'A governed process for expressing and reviewing how capital could be assigned to defined roles.'],
        ['Modeling', 'A modeled result describes a possible structure. It does not move capital.'],
        ['Authorization', 'The explicit policy and identity boundary required before a consequential action may proceed.'],
        ['Settlement', 'Provider submission and processing do not become settled or reconciled state without the required evidence.'],
      ].map(([title, body]) => ({ title, body }))}
      principle="Visible does not mean authoritative. Modeled does not mean executed."
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
