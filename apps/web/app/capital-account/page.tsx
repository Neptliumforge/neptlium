import { FoundationPage } from '@/components/foundation-page';
import { CapitalAccountVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Capital Account',
  description:
    'Explore how Neptlium keeps capital movement organized and connected to portfolio and treasury context.',
  path: '/capital-account',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Capital Account"
      title="Keep capital movement organized."
      intro="Bring funding and capital movement into the same operating picture as portfolio and treasury work so your team can follow what is changing and why."
      anchors={['Capital context', 'Movement', 'Control']}
      lead={[
        'Capital movement should stay connected to context.',
        'Neptlium keeps account activity close to the wider portfolio picture while preserving the boundaries around review, authority and outcome.',
      ]}
      visual={<CapitalAccountVisual />}
      cards={[
        {
          title: 'Capital context',
          body: 'See account activity alongside portfolio and treasury context.',
        },
        {
          title: 'Movement',
          body: 'Keep planned and requested movement easy to follow as it progresses.',
        },
        {
          title: 'Boundaries',
          body: 'Make the relevant account, network and authorization context clear when it matters.',
        },
        {
          title: 'Outcome',
          body: 'Keep intent, action and final financial state distinct.',
        },
      ]}
      principle="Movement is easier to understand when the surrounding context stays visible."
    />
  );
}
