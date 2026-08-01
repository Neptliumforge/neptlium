import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust Center',
  description:
    'Neptlium platform controls, operational transparency, privacy boundaries and risk disclosures.',
  alternates: { canonical: '/trust' },
};

import { DetailPage } from '@/components/detail-page';
export default function TrustPage() {
  return (
    <DetailPage
      eyebrow="Trust Center"
      title="Clear controls. Clear boundaries."
      intro="Platform controls, operational transparency, privacy boundaries and risk disclosures are communicated with care."
      sections={[
        ['Platform controls', 'How access, authorization and consequential actions are governed.'],
        [
          'Operational transparency',
          'How availability, capabilities and restrictions are communicated.',
        ],
        ['Privacy', 'How user and account information is handled through defined boundaries.'],
        ['Risk disclosures', 'How product, asset, provider and market risks are presented.'],
      ]}
    />
  );
}
