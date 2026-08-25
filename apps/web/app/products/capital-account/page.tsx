import { FoundationPage } from '@/components/foundation-page';
import { CapitalAccountVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Account — Neptlium Products',
  description:
    'See how Neptlium Capital Account organizes capital movement and account context alongside treasury, allocation and portfolio work.',
  path: '/products/capital-account',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Products · Capital Account"
      title="Keep capital movement connected to context."
      intro="Capital Account is the Neptlium product for organizing funding and capital movement without separating activity from the wider portfolio and treasury picture."
      anchors={['Account context', 'Movement', 'Control']}
      lead={[
        'Capital movement is easier to understand when the surrounding context stays visible.',
        'Capital Account keeps intent, activity and outcome conceptually distinct while connecting account work to the rest of the Neptlium operating model.',
      ]}
      visual={<CapitalAccountVisual />}
      cards={[
        { title: 'Account context', body: 'Keep capital activity connected to the account and portfolio context around it.' },
        { title: 'Movement', body: 'Organize funding and movement as a visible operating process rather than an isolated event.' },
        { title: 'Boundaries', body: 'Preserve the distinction between intent, authority and financial outcome.' },
        { title: 'Activity', body: 'Understand movement history only where authoritative evidence supports it.' },
      ]}
      principle="Movement belongs inside a wider capital picture."
      cta="Explore all products"
      ctaHref="/products"
    />
  );
}
