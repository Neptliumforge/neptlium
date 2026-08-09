import { DetailPage } from '@/components/detail-page';
export default function NeptliumLinkPage() {
  return (
    <DetailPage
      eyebrow="Infrastructure"
      title="Institutional connectivity for digital capital."
      intro="Neptlium Link is the connectivity layer for coordinating provider infrastructure without claiming to replace custody, blockchain, exchange or identity providers."
      sections={[
        [
          'Capital Account connectivity',
          'Connect supported account and custody infrastructure through governed boundaries.',
        ],
        [
          'Blockchain and exchange connectivity',
          'Coordinate verified provider data without presenting unconfigured integrations as live.',
        ],
        [
          'Identity connectivity',
          'Keep authenticated identity and authorization distinct from provider operations.',
        ],
      ]}
    />
  );
}
