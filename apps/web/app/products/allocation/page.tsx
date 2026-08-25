import { FoundationPage } from '@/components/foundation-page';
import { AllocationVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Allocation — Neptlium Products',
  description:
    'See how Neptlium Allocation helps teams shape capital intent, review it deliberately and keep planning distinct from financial outcome.',
  path: '/products/allocation',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Products · Allocation"
      title="Shape the plan before capital moves."
      intro="Allocation is the Neptlium product for expressing capital intent, organizing capital roles and reviewing a proposed structure before it becomes an action."
      anchors={['Intent', 'Capital roles', 'Review']}
      lead={[
        'A model is useful because it can be examined before it becomes consequential.',
        'Allocation keeps modeling, review, authority and downstream financial outcome understandable as separate stages in one operating process.',
      ]}
      visual={
        <>
          <OperatingModelVisual />
          <AllocationVisual />
        </>
      }
      cards={[
        { title: 'Allocation intent', body: 'Express how capital could be organized without presenting a model as an executed result.' },
        { title: 'Capital roles', body: 'Keep the intended purpose of different pools of capital visible in the decision.' },
        { title: 'Review', body: 'Give the relevant people a clear view of what is proposed and why.' },
        { title: 'Action boundaries', body: 'Preserve the distinction between planning, approval and financial outcome.' },
      ]}
      principle="Model clearly. Review deliberately. Keep intent separate from outcome."
      cta="Explore all products"
      ctaHref="/products"
    />
  );
}
