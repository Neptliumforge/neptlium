import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
import { CapitalSystemVisual, OperatingModelVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Neptlium Platform | Capital Operating Infrastructure',
  description: 'See how portfolio context, account infrastructure, treasury and allocation work as one capital system.',
  alternates: { canonical: '/platform' },
};

export default function Page() {
  return (
    <FoundationPage
      title="One operating environment for modern capital."
      intro="Portfolio context, account infrastructure, treasury and allocation work as one system—without collapsing analysis, authorization and execution into one action."
      anchors={['Architecture', 'Platform systems', 'Operating model']}
      lead={[
        'From visibility to controlled action.',
        'Neptlium connects what capital is, where it sits and how a proposed change should be reviewed before anything moves.',
      ]}
      visual={<><CapitalSystemVisual /><OperatingModelVisual /></>}
      cards={[
        ['Portfolio Intelligence', 'Composition, concentration, liquidity and structure in one capital view.'],
        ['Capital Account', 'Supported assets and networks organized within explicit account boundaries.'],
        ['Treasury', 'Liquidity, reserves and readiness connected to the wider portfolio.'],
        ['Allocation', 'Observe, model, review and authorize without confusing intent with execution.'],
      ].map(([title, body]) => ({ title, body }))}
      principle="Observe · Understand · Model · Review · Authorize"
      cta="Explore Neptlium"
      ctaHref="/portfolio-intelligence"
    />
  );
}
