import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Capital Activity Context',
  description:
    'A supporting explanation of how Neptlium distinguishes capital-activity records, state and authenticated ownership boundaries.',
  path: '/capital-activity',
  index: false,
});

export default function CapitalActivityPage() {
  return (
    <DetailPage
      eyebrow="Supporting product context"
      title="Capital activity belongs beside its state and authority."
      intro="Operational movement records are an authenticated application concern. The public site does not display transactions or imply that activity exists without authoritative source evidence."
      sections={[
        [
          'Authoritative records',
          'Activity becomes operational truth only when the responsible system provides sufficient evidence.',
        ],
        [
          'Explicit state',
          'Requested, submitted, processing, settled, failed and reconciled states remain distinct where applicable.',
        ],
        [
          'Controlled visibility',
          'Authentication, ownership and authorization govern access to operational capital records.',
        ],
      ]}
    />
  );
}
