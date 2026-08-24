import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Press and Media Enquiries',
  description:
    'Official Neptlium media enquiry information. Published announcements should be indexed individually only when verified content exists.',
  path: '/press',
  index: false,
});

export default function PressPage() {
  return (
    <DetailPage
      eyebrow="Press"
      title="Official Neptlium communications."
      intro="Verified company announcements should be published as dated, sourceable content. Until that publication surface exists, this route serves media enquiries rather than search acquisition."
      sections={[
        [
          'Verified communications',
          'Product capability, partnerships, regulatory status and operating claims are published only with supporting evidence.',
        ],
        [
          'Media enquiries',
          'Requests for verified company information may be directed to support@neptlium.com.',
        ],
      ]}
    />
  );
}
