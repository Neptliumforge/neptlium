import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';
export const metadata: Metadata = {
  title: 'Platform',
  description:
    'A unified operating environment for observing, modeling and controlling digital capital.',
  alternates: { canonical: '/platform' },
};
export default function Page() {
  return (
    <DetailPage
      eyebrow="Platform"
      title="One operating environment for modern capital."
      intro="Neptlium organizes portfolio intelligence, Capital Account, treasury and allocation without collapsing observation, intent and authorization into one action."
      sections={[
        [
          'Observe with context',
          'Bring composition, concentration, liquidity and capital structure into a coherent operating view.',
        ],
        [
          'Model deliberately',
          'Compare possible structures in an analytical workspace. Modeling does not move capital and is never an execution instruction.',
        ],
        [
          'Authorize explicitly',
          'Keep consequential decisions reviewable, attributable and separate from execution.',
        ],
      ]}
    />
  );
}
