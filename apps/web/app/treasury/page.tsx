import { FoundationPage } from '@/components/foundation-page';
import { TreasuryVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Treasury Operating Platform',
  description:
    'Explore how Neptlium structures liquidity, reserves and operational readiness as distinct treasury states for institutional capital teams.',
  path: '/treasury',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Treasury"
      title="Liquidity is more than a balance."
      intro="Treasury context should distinguish capital that is observed, reserved, available, planned or operationally ready rather than flattening those states into one number."
      anchors={['Treasury context', 'Capital readiness', 'Control model']}
      lead={[
        'Connect liquidity context to the next decision.',
        'Neptlium is designed to show treasury state in relation to portfolio and allocation intent while preserving the evidence required before consequential capital movement.',
      ]}
      visual={<TreasuryVisual />}
      cards={[
        {
          title: 'Liquidity context',
          body: 'Understand observed capital without automatically treating observation as available balance.',
        },
        {
          title: 'Reserve context',
          body: 'Keep intentionally preserved capital distinguishable from capital intended for another operating role.',
        },
        {
          title: 'Operational readiness',
          body: 'Represent readiness only when the required account, policy, authorization and infrastructure evidence exists.',
        },
        {
          title: 'Governed action',
          body: 'Keep modeled, requested, approved, submitted, settled and reconciled states explicit throughout the workflow.',
        },
      ]}
      principle="Observed does not mean available. Approved does not mean settled."
      cta="Request access"
      ctaHref="/contact"
    />
  );
}
