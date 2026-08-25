import { FoundationPage } from '@/components/foundation-page';
import { PortfolioVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Portfolio Intelligence and Capital Context',
  description:
    'Explore how Neptlium brings portfolio composition, concentration and liquidity context into one clear operating view.',
  path: '/portfolio-intelligence',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Portfolio"
      title="See the whole portfolio picture."
      intro="Bring composition, concentration and liquidity context together so your team can understand what matters without losing sight of the wider capital picture."
      anchors={['Portfolio context', 'What matters', 'Control']}
      lead={[
        'Context makes the portfolio easier to use.',
        'Neptlium is designed to connect positions with liquidity and operating context while keeping uncertainty visible when the underlying evidence is incomplete.',
      ]}
      visual={<PortfolioVisual />}
      cards={[
        ['Composition', 'Understand what the portfolio contains when the supporting data is available.'],
        ['Concentration', 'See where exposure gathers across the portfolio.'],
        ['Liquidity', 'Keep liquidity context close to the positions it affects.'],
        ['Capital roles', 'Understand how different parts of the portfolio fit into the wider operating objective.'],
      ].map(([title, body]) => ({ title, body }))}
      principle="A clearer portfolio view starts with clearer context."
    />
  );
}
