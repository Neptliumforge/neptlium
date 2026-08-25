import { FoundationPage } from '@/components/foundation-page';
import { AllocationVisual, OperatingModelVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Institutional Capital Allocation Platform',
  description:
    'Explore Neptlium’s governed allocation model for shaping capital intent while keeping modeling, approval and execution as distinct states.',
  path: '/allocation',
});

export default function Page() {
  return (
    <FoundationPage
      eyebrow="Allocation"
      title="Capital structure before capital movement."
      intro="Model how capital could be positioned, review that intent against policy and preserve the distinction between a proposed structure and an executed financial outcome."
      anchors={['Decision pathway', 'Capital roles', 'Authorization']}
      lead={[
        'Model. Review. Authorize. Then establish execution truth.',
        'Neptlium is designed to keep analytical context, allocation intent, approval and downstream execution evidence legible as different states.',
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
          body: 'Express a proposed capital structure without representing the proposal as actual movement.',
        },
        {
          title: 'Policy context',
          body: 'Evaluate allocation intent against the constraints and operating context that govern the decision.',
        },
        {
          title: 'Review and approval',
          body: 'Separate analysis from the authority required to approve a consequential action.',
        },
        {
          title: 'Execution evidence',
          body: 'Treat provider submission, settlement and reconciliation as downstream states requiring their own evidence.',
        },
      ]}
      principle="Modeled does not mean executed. Approved does not mean submitted."
      cta="Request access"
      ctaHref="/contact"
    />
  );
}
