import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press',
  description:
    'Official Neptlium company announcements, verified statements and media enquiry information.',
  alternates: { canonical: '/press' },
};

import { DetailPage } from '@/components/detail-page';
export default function PressPage() {
  return (
    <DetailPage
      eyebrow="Press"
      title="Official Neptlium communications."
      intro="Company announcements, verified statements and media resources are published through official Neptlium channels."
      sections={[
        [
          'Verified channels',
          'Official company information is published through Neptlium channels.',
        ],
        [
          'Media enquiries',
          'Requests for verified company information may be directed to support@neptlium.com.',
        ],
      ]}
    />
  );
}
