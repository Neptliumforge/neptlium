import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Portfolio Intelligence',
  description: 'Understand capital as a connected portfolio system.',
  alternates: { canonical: '/portfolio-intelligence' },
};
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Portfolio Intelligence"
      title="See capital as a system—not a collection of positions."
      intro="A governed portfolio view for holdings, performance, liquidity, concentration, exposure, capital activity and portfolio role. The experience is designed to make context visible before decisions are made."
      anchors={['Portfolio view', 'Analytical dimensions', 'Operating context']}
      cards={[
        [
          'Total portfolio value',
          'A complete view of connected capital, with unavailable sources kept visibly separate.',
        ],
        [
          'Performance and contribution',
          'Understand realized and unrealized performance through assets, allocations, activity and time horizon.',
        ],
        [
          'Concentration and exposure',
          'Identify where capital is accumulating and how each holding relates to the wider mandate.',
        ],
        [
          'Capital activity',
          'Connect deposits, transfers, distributions and withdrawals with portfolio decisions.',
        ],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
