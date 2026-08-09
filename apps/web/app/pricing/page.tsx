import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Access and Availability | Neptlium',
  description: 'Current access information for the Neptlium platform.',
  alternates: { canonical: '/pricing' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <DetailPage title="Clear access. No invented tiers." intro="Public pricing and allocation minimums have not been established." sections={[
    ['Current access', 'Account creation is available through the Neptlium application.'],
    ['Capability boundaries', 'An account does not imply custody, execution or production asset availability.'],
    ['Product truth', 'Terms and availability are published only when they are established.'],
  ]} />;
}
