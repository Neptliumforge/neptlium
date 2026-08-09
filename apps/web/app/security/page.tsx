import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';
import { SecurityFlowVisual } from '@/components/product-visuals';

export const metadata: Metadata = {
  title: 'Security | Neptlium',
  description: 'Verified access, explicit authorization and controlled server-side boundaries at Neptlium.',
  alternates: { canonical: '/security' },
};

export default function Page() {
  return (
    <DetailPage
      title="Control is part of the system."
      intro="Access, authorization and privileged operations remain separate concerns. These are architecture principles—not claims of certification, insurance or regulatory approval."
      visual={<SecurityFlowVisual />}
      sections={[
        ['Authentication', 'Verified identity establishes access before account operations.'],
        ['Authorization', 'Consequential actions remain explicit, attributable and distinct from execution.'],
        ['Server-side privilege', 'Privileged credentials and service-role operations remain behind controlled server boundaries.'],
        ['Data isolation', 'Row-level security and ownership boundaries constrain access to account information.'],
        ['Idempotency', 'Financial operations are designed against accidental duplication.'],
        ['Auditability', 'Operational events and state transitions are designed to remain traceable.'],
        ['Fail-closed behavior', 'Unavailable dependencies do not become simulated success.'],
      ]}
    />
  );
}
