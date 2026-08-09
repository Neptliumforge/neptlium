import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Allocation',
  description: 'Observe, model and authorize capital decisions.',
  alternates: { canonical: '/allocation' },
};
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Allocation"
      title="Capital structure before capital movement."
      intro="Neptlium separates understanding a portfolio from changing it. Model allocation scenarios, evaluate structure and preserve explicit authorization between intent and execution."
      anchors={['Decision pathway', 'Portfolio roles', 'Authorization']}
      cards={[
        [
          'Observe',
          'Understand current structure, concentration, liquidity and portfolio role before proposing a change.',
        ],
        [
          'Model',
          'Compare possible allocations against mandate, risk, liquidity and time horizon without presenting forecasts.',
        ],
        [
          'Authorize',
          'Keep consequential capital decisions explicit, attributable and subject to the controls that apply.',
        ],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
