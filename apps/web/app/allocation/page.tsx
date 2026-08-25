import { FoundationPage } from '@/components/foundation-page';
import { AllocationVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Capital Allocation Platform',
  description:
    'Explore how Neptlium helps teams shape allocation intent, review it clearly and keep authority explicit before capital moves.',
  path: '/allocation',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Allocation"
      title="Shape the plan before capital moves."
      intro="Use allocation to turn investment intent into a clear plan your team can review before anything becomes an action."
      anchors={['Allocation intent', 'Capital roles', 'Review']}
      lead={[
        'Model the next move without confusing it with the outcome.',
        'Neptlium keeps allocation intent, review and downstream action understandable as separate steps in the same operating process.',
      ]}
      visual={
        <>
          <OperatingModelVisual />
          <AllocationVisual />
        </>
      }
      cards={[
        {
          title: 'Allocation intent',
          body: 'Express how capital could be positioned before anything changes.',
        },
        {
          title: 'Capital roles',
          body: 'Keep the purpose of different pools of capital visible in the decision.',
        },
        {
          title: 'Review',
          body: 'Give the right people a clear view of what is being proposed.',
        },
        {
          title: 'Action boundaries',
          body: 'Keep planning, approval and financial outcome visibly distinct.',
        },
      ]}
      principle="Plan clearly. Review deliberately. Keep outcomes separate from intent."
    />
  );
}
