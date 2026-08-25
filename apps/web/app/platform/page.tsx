import { FoundationPage } from '@/components/foundation-page';
import { CapitalSystemVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Operating Platform for Investment Organizations',
  description:
    'Explore how Neptlium brings portfolio context, capital operations, treasury and governed allocation into one institutional operating environment.',
  path: '/platform',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Platform"
      title="One operating environment for modern capital."
      intro="Neptlium brings portfolio context, capital operations, treasury and governed allocation into one environment while preserving the boundaries between visibility, authority and execution."
      anchors={['Operating environment', 'Platform systems', 'Control model']}
      lead={[
        'From capital context to governed action.',
        'Understand the operating picture, shape intent and move toward consequential action only through explicit authority and verified state.',
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
          body: 'Bring composition and portfolio context into a coherent institutional operating view.',
          href: '/portfolio-intelligence',
        },
        {
          title: 'Capital Account',
          body: 'Organize capital context and controlled movement without presenting configured infrastructure as guaranteed availability.',
          href: '/capital-account',
        },
        {
          title: 'Treasury',
          body: 'Understand liquidity, reserves and operating readiness as distinct capital states.',
          href: '/treasury',
        },
        {
          title: 'Allocation',
          body: 'Model and govern capital intent without confusing a plan, approval or request with execution.',
          href: '/allocation',
        },
      ]}
      principle="Visible does not mean authoritative. Modeled does not mean executed."
      cta="Request access"
      ctaHref="/contact"
    />
  );
}
