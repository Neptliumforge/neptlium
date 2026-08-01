import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Performance',
  description: 'Understand performance in portfolio context.',
  alternates: { canonical: '/performance' },
};
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Performance"
      title="Returns, understood in context."
      intro="A number alone cannot explain a portfolio. Performance connects assets, allocations, decisions, risks and time horizons so investors can understand what shaped an outcome."
      anchors={['Performance context', 'Analytical dimensions', 'Review']}
      cards={[
        'Asset contribution',
        'Realized performance',
        'Unrealized performance',
        'Allocation changes',
        'Concentration effects',
        'Portfolio mandate alignment',
        'Time horizon',
        'Capital activity',
      ].map((title) => ({
        title,
        body: `A structured view of ${title.toLowerCase()} as part of the wider portfolio context.`,
      }))}
      cta="Explore Performance"
      ctaHref="/platform"
    />
  );
}
