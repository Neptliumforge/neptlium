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
          'Controlled boundaries',
          'Privileged operations and capital actions remain separated from public application surfaces.',
        ],
        [
          'Auditability and authorization',
          'Intent, review and authorization should remain attributable and distinct from execution.',
        ],
      ]}
    />
  );
}
