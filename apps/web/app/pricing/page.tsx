import { PageContext } from '@/components/page-context';
import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Access and Availability | Neptlium',
  description: 'Current access information for the Neptlium platform.',
  alternates: { canonical: '/pricing' },
  robots: { index: false, follow: true },
};

function PageContent() {
  return <DetailPage title="Access and pricing." intro="Review the applicable access requirements and commercial terms before using a Neptlium service. Public pricing and allocation minimums have not been established." sections={[
    ['Current access', 'Account creation is available through the Neptlium application.'],
    ['Capability boundaries', 'An account does not imply custody, execution or production asset availability.'],
    ['Product truth', 'Terms and availability are published only when they are established.'],
  ]} />;
}

export default function Page() {
  return <><PageContent /><PageContext route="/pricing" /></>;
}
