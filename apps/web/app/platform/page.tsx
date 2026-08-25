import { FoundationPage } from '@/components/foundation-page';
import { CapitalSystemVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operating Platform for Investment Organizations',
  description:
    'Explore how Neptlium connects portfolio context, capital movement, treasury and allocation in one capital operating platform.',
  path: '/platform',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Platform"
      title="See how your capital work fits together."
      intro="Neptlium connects portfolio context, capital movement, treasury and allocation so your team can understand the whole picture before deciding what happens next."
      anchors={['How it fits together', 'Platform areas', 'Control']}
      lead={[
        'One place to understand what matters next.',
        'Start with the portfolio context, connect treasury and capital movement, shape allocation intent, and keep control clear throughout the process.',
      ]}
      visual={
        <>
          <CapitalSystemVisual />
          <OperatingModelVisual />
        </>
      }
      cards={[
        {
          title: 'Portfolio',
          body: 'See what you own and understand it in context.',
          href: '/portfolio-intelligence',
        },
        {
          title: 'Capital Account',
          body: 'Keep capital movement organized and easy to follow.',
          href: '/capital-account',
        },
        {
          title: 'Treasury',
          body: 'See liquidity alongside the rest of your capital picture.',
          href: '/treasury',
        },
        {
          title: 'Allocation',
          body: 'Shape where capital should go before anything moves.',
          href: '/allocation',
        },
      ]}
      principle="Understand first. Shape intent second. Keep authority explicit throughout."
    />
  );
}
