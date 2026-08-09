import { DetailPage } from '@/components/detail-page';
export default function CapitalActivityPage() {
  return (
    <DetailPage
      eyebrow="Platform"
      title="Capital activity, recorded with context."
      intro="Operational history and capital movement records belong inside an authenticated, provider-backed environment. No public activity or fabricated transactions are displayed here."
      sections={[
        [
          'Connected records',
          'Activity becomes available only when authoritative sources are connected.',
        ],
        ['Explicit state', 'Pending, completed and failed states remain distinct and traceable.'],
        [
          'Controlled visibility',
          'Authenticated access and ownership boundaries govern operational records.',
        ],
      ]}
    />
  );
}
