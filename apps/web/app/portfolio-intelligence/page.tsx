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
      title="Understand the whole position."
      intro="Capital becomes more useful when ownership, liquidity, concentration and allocation can be understood together. Portfolio Intelligence brings that context into one governed view."
      anchors={['Portfolio view', 'Analytical dimensions', 'Operating context']}
      cards={[
        [
          'Total portfolio value',
          'A coherent view of capital composition grounded in authoritative portfolio information.',
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
