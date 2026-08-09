import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Capital Activity | Neptlium',
  description: 'Capital movement records presented with state, ownership and portfolio context.',
  alternates: { canonical: '/capital-activity' },
};

export default function CapitalActivityPage() {
  return <DetailPage title="Capital activity, recorded with context." intro="Movement records belong beside their account state and portfolio purpose. No public transactions are displayed." sections={[
    ['Authoritative records', 'Activity appears when a verified account source provides it.'],
    ['Explicit state', 'Pending, completed and failed events remain distinct.'],
    ['Controlled visibility', 'Authenticated access and ownership boundaries govern operational records.'],
  ]} />;
}
