import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
import { TreasuryVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Treasury | Neptlium',
  description: 'Understand available capital, reserves and operational readiness.',
  alternates: { canonical: '/treasury' },
};

export default function Page() {
  return (
    <FoundationPage
      title="Liquidity is more than a balance."
      intro="Understand what is available, reserved and operationally ready."
      anchors={['Treasury context', 'Capital readiness', 'Planning']}
      lead={[
        'Between portfolio context and allocation.',
        'Treasury shows which capital can support the next decision and which capital has a different role.',
      ]}
      visual={<TreasuryVisual />}
      cards={[
        ['Liquidity', 'Capital that can be acted on.'],
        ['Reserve', 'Capital intentionally preserved.'],
        ['Readiness', 'Capital operationally positioned for the next decision.'],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
