import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
import { AllocationVisual, OperatingModelVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Allocation | Neptlium',
  description: 'Model capital structure without confusing analysis with execution.',
  alternates: { canonical: '/allocation' },
};

export default function Page() {
  return (
    <FoundationPage
      title="Capital structure before capital movement."
      intro="Model how capital could be positioned without confusing analysis with execution."
      anchors={['Decision pathway', 'Capital roles', 'Authorization']}
      lead={[
        'Observe. Model. Review. Authorize.',
        'Each stage protects the distinction between understanding a possible structure and approving a consequential action.',
      ]}
      visual={<><OperatingModelVisual /><AllocationVisual /></>}
      cards={[
        ['Reserve', 'Capital intentionally preserved for liquidity and resilience.'],
        ['Core', 'Capital aligned with the portfolio’s central long-term role.'],
        ['Growth', 'Capital positioned for measured expansion.'],
        ['Opportunity', 'Capital reserved for defined, selective opportunities.'],
        ['Restricted', 'Capital held outside an active allocation mandate.'],
        ['Analytical context', 'Concentration · Liquidity · Volatility · Reserve coverage · Network · Counterparty · Drift · Utilization'],
      ].map(([title, body]) => ({ title, body }))}
      principle="Modeling does not move capital."
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
