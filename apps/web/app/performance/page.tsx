import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Performance Context | Neptlium',
  description: 'Understand portfolio outcomes through contribution, time horizon and capital activity.',
  alternates: { canonical: '/performance' },
};

export default function Page() {
  return <DetailPage title="Performance needs context." intro="A number alone cannot explain a portfolio. Outcomes belong beside contribution, allocation, activity and time horizon." sections={[
    ['Contribution', 'Understand which positions shaped an observed portfolio outcome.'],
    ['Time horizon', 'Evaluate change within the period relevant to the portfolio mandate.'],
    ['Capital activity', 'Separate portfolio movement from deposits, transfers and withdrawals.'],
    ['Availability', 'Performance is shown only when authoritative portfolio data supports it.'],
  ]} />;
}
