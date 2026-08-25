import { FoundationPage } from '@/components/foundation-page';
import { PortfolioVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Portfolio Intelligence and Capital Context',
  description:
    'Explore how Neptlium organizes portfolio composition, concentration, liquidity and capital-role context without manufacturing unsupported balances or performance.',
  path: '/portfolio-intelligence',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Portfolio"
      title="Understand capital in portfolio context."
      intro="Bring composition, concentration, liquidity and capital roles into one operating view while keeping unknown, estimated and authoritative values visibly distinct."
      anchors={['Portfolio context', 'Analytical dimensions', 'Operating model']}
      lead={[
        'A portfolio is more useful when its context is explicit.',
        'Neptlium is designed to connect positions with their operating role and liquidity context without turning missing data into zero or modeled values into observed truth.',
      ]}
      visual={<PortfolioVisual />}
      cards={[
        ['Composition', 'Understand what the portfolio contains when authoritative position data is available.'],
        ['Concentration', 'See where exposure accumulates without manufacturing certainty from incomplete inputs.'],
        ['Liquidity', 'Keep observed, available, reserved and restricted capital states distinguishable.'],
        ['Capital roles', 'Understand how capital is positioned in relation to the wider operating objective.'],
      ].map(([title, body]) => ({ title, body }))}
      principle="Unknown does not mean zero. Modeled does not mean observed."
      cta="Request access"
      ctaHref="/contact"
    />
  );
}
