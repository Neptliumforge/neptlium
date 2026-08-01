import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Treasury',
  description: 'Connect liquidity, reserves and capital readiness.',
  alternates: { canonical: '/treasury' },
};
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Treasury"
      title="Liquidity is part of the strategy."
      intro="Treasury connects portfolio ownership with capital readiness. Organize available capital, reserves, obligations and allocation capacity without losing sight of the wider portfolio."
      anchors={['Treasury context', 'Capital readiness', 'Planning']}
      cards={[
        [
          'Liquidity and reserves',
          'Understand what is available, reserved or positioned for future allocation.',
        ],
        [
          'Upcoming obligations',
          'Bring commitments and expected capital needs into the operating view.',
        ],
        [
          'Allocation capacity',
          'Connect treasury context with portfolio roles and deliberate planning.',
        ],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore Treasury"
      ctaHref="/platform"
    />
  );
}
