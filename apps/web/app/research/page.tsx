import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Neptlium Research — Publication Surface',
  description:
    'Neptlium research topics and publication direction. This route remains non-indexable until substantive, dated research is published.',
  path: '/research',
  index: false,
});

export default function Page() {
  return (
    <DetailPage
      eyebrow="Research"
      title="Research should earn its authority."
      intro="Neptlium intends to publish substantive, dated perspectives on capital operations. No research library is represented as available until those publications exist."
      sections={[
        [
          'Capital operations',
          'How portfolio context, liquidity, treasury and allocation interact without collapsing their authority boundaries.',
        ],
        [
          'Allocation systems',
          'How modeling, policy, review and authorization can remain distinct from execution.',
        ],
        [
          'Infrastructure risk',
          'How provider, network and operational dependencies affect institutional capital systems.',
        ],
      ]}
    />
  );
}
