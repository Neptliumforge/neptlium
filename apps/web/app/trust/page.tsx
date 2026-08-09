import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Trust Center | Neptlium',
  description: 'Neptlium controls, privacy boundaries and risk disclosures.',
  alternates: { canonical: '/trust' },
};

export default function TrustPage() {
  return <DetailPage title="Clear controls. Clear boundaries." intro="Operational state, privacy and product risk should remain understandable." sections={[
    ['Platform controls', 'How access, authorization and consequential actions are governed.'],
    ['Operational transparency', 'How capabilities and restrictions are communicated.'],
    ['Privacy', 'How user and account information remains within defined boundaries.'],
    ['Risk disclosures', 'How product, asset, network and market risks are presented.'],
  ]} />;
}
