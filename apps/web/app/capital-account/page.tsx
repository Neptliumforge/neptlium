import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
import { CapitalAccountVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Institutional Capital Account',
  description:
    'Explore Neptlium’s capital-account operating model for capital context, funding intent and controlled movement within explicit authority boundaries.',
  alternates: { canonical: '/capital-account' },
};

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Capital Account"
      title="Capital needs a clear operating boundary."
      intro="Neptlium is designed to organize capital context, funding intent and controlled movement without turning infrastructure configuration into a promise of asset, network or provider availability."
      anchors={['Account context', 'Operating boundaries', 'Availability']}
      lead={[
        'A governed account view, not a trading screen.',
        'Capital-account information stays connected to the wider portfolio while account state, network context, eligibility and authorization remain explicit.',
      ]}
      visual={<CapitalAccountVisual />}
      cards={[
        {
          title: 'Capital context',
          body: 'Understand account state in relation to portfolio and treasury context.',
        },
        {
          title: 'Funding intent',
          body: 'Represent planned or requested capital movement without presenting it as completed funding.',
        },
        {
          title: 'Operating boundaries',
          body: 'Keep network, account, eligibility and authorization boundaries visible when they matter.',
        },
        {
          title: 'Availability truth',
          body: 'Configured infrastructure, supported source code and production availability remain separate claims.',
        },
      ]}
      principle="Configured does not mean available. Requested does not mean settled."
      cta="Request access"
      ctaHref="/contact"
    />
  );
}
