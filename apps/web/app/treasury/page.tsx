import { FoundationPage } from '@/components/foundation-page';
import { TreasuryVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Treasury Operating Platform',
  description:
    'Explore how Neptlium keeps liquidity, reserves and capital readiness connected to the wider portfolio context.',
  path: '/treasury',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Treasury"
      title="See liquidity in context."
      intro="Treasury becomes more useful when liquidity, reserves and capital readiness stay connected to the rest of the portfolio instead of living in a separate view."
      anchors={['Treasury context', 'Capital readiness', 'Control']}
      lead={[
        'Know where capital stands before deciding what comes next.',
        'Neptlium brings treasury context into the same operating picture as portfolio and allocation work while keeping important state boundaries clear.',
      ]}
      visual={<TreasuryVisual />}
      cards={[
        {
          title: 'Liquidity context',
          body: 'See liquidity alongside the rest of the capital picture.',
        },
        {
          title: 'Reserves',
          body: 'Keep intentionally preserved capital easy to distinguish.',
        },
        {
          title: 'Readiness',
          body: 'Understand when capital is ready for the next step and when it is not.',
        },
        {
          title: 'Control',
          body: 'Keep review and authority visible as treasury intent moves forward.',
        },
      ]}
      principle="Liquidity is useful when its context is clear."
    />
  );
}
