import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Performance Context',
  description:
    'Supporting product context for how Neptlium would distinguish observed portfolio outcomes from contributions, capital activity and unsupported inference.',
  path: '/performance',
  index: false,
});

export default function Page() {
  return (
    <DetailPage
      eyebrow="Supporting product context"
      title="Performance requires authoritative context."
      intro="The public site does not present returns or portfolio outcomes. Performance information belongs in an authenticated environment only when authoritative portfolio data, methodology and period context support it."
      sections={[
        [
          'Observed outcomes',
          'A calculated or modeled value must not be presented as an observed portfolio result without the required source evidence.',
        ],
        [
          'Time horizon',
          'Any performance view requires an explicit period and a methodology appropriate to that context.',
        ],
        [
          'Capital activity',
          'Deposits, withdrawals and transfers must remain distinguishable from investment performance.',
        ],
        [
          'Availability',
          'Source implementation does not by itself establish that performance reporting is available in production.',
        ],
      ]}
    />
  );
}
