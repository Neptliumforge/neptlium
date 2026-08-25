import { FoundationPage } from '@/components/foundation-page';
import { PortfolioVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Portfolio Intelligence — Neptlium Products',
  description:
    'See how Neptlium Portfolio Intelligence brings portfolio composition, concentration and liquidity context into one operating view.',
  path: '/products/portfolio-intelligence',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Products · Portfolio Intelligence"
      title="See the portfolio as operating context, not a disconnected snapshot."
      intro="Portfolio Intelligence is the Neptlium product for bringing composition, concentration, liquidity and capital-role context together without manufacturing certainty where evidence is incomplete."
      anchors={['Portfolio context', 'Relationships', 'Clarity']}
      lead={[
        'Portfolio information becomes more useful when it remains connected to treasury, movement and allocation decisions.',
        'Neptlium is designed to preserve the difference between visible context and authoritative financial state while making the whole picture easier to reason about.',
      ]}
      visual={<PortfolioVisual />}
      cards={[
        { title: 'Composition', body: 'Understand what the portfolio contains where supporting data is available.' },
        { title: 'Concentration', body: 'See where exposure gathers across the portfolio without turning incomplete evidence into certainty.' },
        { title: 'Liquidity context', body: 'Keep liquidity close to the positions and decisions it affects.' },
        { title: 'Capital roles', body: 'Connect portfolio structure to the intended role of capital in the wider operating model.' },
      ]}
      principle="A useful portfolio view explains relationships as clearly as positions."
      cta="Explore all products"
      ctaHref="/products"
    />
  );
}
