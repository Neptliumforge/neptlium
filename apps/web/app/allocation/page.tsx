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
      title="Move from observation to deliberate allocation."
      intro="Allocation brings portfolio purpose, possible structures and explicit control into one decision pathway. Modeling is analytical; authorization remains a separate governed step."
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
