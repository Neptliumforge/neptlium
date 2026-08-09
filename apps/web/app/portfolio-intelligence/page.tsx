import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
import { PortfolioVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Portfolio Intelligence | Neptlium',
  description: 'See composition, concentration, liquidity and structure in one capital view.',
  alternates: { canonical: '/portfolio-intelligence' },
};

export default function Page() {
  return (
    <FoundationPage
      title="Understand the whole position."
      intro="See composition, concentration, liquidity and structure as parts of the same capital view."
      anchors={['Portfolio view', 'Analytical dimensions', 'Platform context']}
      lead={[
        'Capital is more useful in context.',
        'A portfolio view connects individual positions to their role, liquidity and relationship with the whole.',
      ]}
      visual={<PortfolioVisual />}
      cards={[
        ['Composition', 'Understand what the portfolio contains.'],
        ['Concentration', 'See where exposure accumulates.'],
        ['Liquidity', 'Distinguish capital that can be acted on.'],
        ['Structure', 'Understand how capital is positioned across strategic roles.'],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
