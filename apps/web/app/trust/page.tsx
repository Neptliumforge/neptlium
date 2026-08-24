import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Trust and Control Context',
  description:
    'Supporting context for Neptlium security, privacy and risk boundaries. The authoritative public control narrative is maintained on the Security page.',
  path: '/trust',
  index: false,
});

export default function TrustPage() {
  return (
    <DetailPage
      eyebrow="Supporting control context"
      title="Trust begins with explicit boundaries."
      intro="Neptlium describes controls, privacy and product risk without presenting architecture principles as certifications, guarantees or regulatory approvals."
      sections={[
        ['Platform controls', 'Authentication, authorization and consequential actions remain distinct responsibilities.'],
        ['Operational transparency', 'Configured, available, planned and unavailable states should remain explicit.'],
        ['Privacy boundaries', 'User and account information remains subject to defined access and ownership controls.'],
        ['Risk communication', 'Product, infrastructure and market risks should be presented without manufactured certainty.'],
      ]}
    />
  );
}
