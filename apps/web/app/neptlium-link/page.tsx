import { DetailPage } from '@/components/detail-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Infrastructure Connectivity Context',
  description:
    'Supporting product context for how Neptlium separates identity, authorization and external infrastructure operations.',
  path: '/neptlium-link',
  index: false,
});

export default function NeptliumLinkPage() {
  return (
    <DetailPage
      eyebrow="Supporting product context"
      title="Connectivity requires explicit boundaries."
      intro="Neptlium source contains infrastructure-integration patterns, but public marketing does not convert implementation or configuration into a claim of live provider, network or account availability."
      sections={[
        [
          'Infrastructure context',
          'External systems remain separate from Neptlium identity, authorization and canonical financial state.',
        ],
        [
          'Provider evidence',
          'External observations remain evidence until the required validation, posting, settlement and reconciliation conditions are satisfied.',
        ],
        [
          'Availability truth',
          'Configured integration, verified capability and live execution are intentionally different states.',
        ],
      ]}
    />
  );
}
