import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';
export const metadata: Metadata = {
  title: 'Security',
  description: 'The control principles and infrastructure boundaries guiding Neptlium.',
  alternates: { canonical: '/security' },
};
export default function Page() {
  return (
    <DetailPage
      eyebrow="Security"
      title="Control, made explicit."
      intro="Neptlium is designed around deliberate access, legible state and firm infrastructure boundaries. These principles are not claims of certification, insurance or regulatory approval."
      sections={[
        [
          'Role-aware access',
          'Permissions should reflect responsibility, with clear separation between observation, modeling and authorization.',
        ],
        [
          'Provider verification',
          'Connected sources and execution providers must be verified before their data or capabilities can be treated as available.',
        ],
        [
          'Auditability and controlled execution',
          'Intent and authorization should remain reviewable. Execution is unavailable until the required custody, ledger and security systems exist.',
        ],
      ]}
    />
  );
}
