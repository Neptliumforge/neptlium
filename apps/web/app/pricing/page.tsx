import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';
export const metadata: Metadata = {
  title: 'Access and availability',
  description: 'Current access information for the Neptlium platform.',
  alternates: { canonical: '/pricing' },
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <DetailPage
      eyebrow="Access"
      title="Platform access is developing."
      intro="Public pricing, allocation minimums and investment terms have not been established. Neptlium does not publish invented tiers or prices."
      sections={[
        [
          'Current availability',
          'Access is directed through the platform. Product capabilities remain dependent on backend, provider and security infrastructure.',
        ],
        [
          'No implied entitlement',
          'Marketing descriptions do not promise custody, execution, investment availability or production asset support.',
        ],
        ['Access Neptlium', 'Continue to app.neptlium.com to enter the authenticated platform.'],
      ]}
    />
  );
}
