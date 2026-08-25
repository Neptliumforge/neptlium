import { FoundationPage } from '@/components/foundation-page';
import { TreasuryVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Treasury — Neptlium Products',
  description:
    'See how Neptlium Treasury keeps liquidity, reserves and capital readiness connected to the wider capital operating picture.',
  path: '/products/treasury',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Products · Treasury"
      title="See liquidity in the context that gives it meaning."
      intro="Treasury is the Neptlium product for understanding liquidity, reserves and capital readiness alongside portfolio and allocation context."
      anchors={['Liquidity context', 'Readiness', 'Coordination']}
      lead={[
        'Liquidity should inform the next decision without becoming a detached balance screen.',
        'Treasury connects capital readiness to the broader operating model while preserving the difference between what is observed, reserved, available and ready for action.',
      ]}
      visual={<TreasuryVisual />}
      cards={[
        { title: 'Liquidity context', body: 'Read liquidity alongside the capital positions and decisions it affects.' },
        { title: 'Reserves', body: 'Keep intentionally preserved capital distinct from capital intended for other roles.' },
        { title: 'Readiness', body: 'Understand capital readiness without treating configuration or visibility as availability.' },
        { title: 'Coordination', body: 'Connect treasury context to Capital Account and Allocation without collapsing their jobs.' },
      ]}
      principle="Liquidity becomes operationally useful when its context stays clear."
      cta="Explore all products"
      ctaHref="/products"
    />
  );
}
