import { DetailPage } from '@/components/detail-page';
import { SecurityFlowVisual } from '@/components/product-visuals';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Security and Control Architecture',
  description:
    'Explore Neptlium’s public security principles for identity, authorization, server-side privilege, data boundaries, idempotency, auditability and fail-closed behavior.',
  path: '/security',
});

export default function Page() {
  return (
    <DetailPage
      eyebrow="Security and controls"
      title="Control is part of the operating architecture."
      intro="Neptlium separates identity, authorization, privileged operations, financial state and provider evidence. These are architecture principles—not claims of certification, insurance, regulatory approval or perfect security."
      visual={<SecurityFlowVisual />}
      sections={[
        ['Authentication', 'Identity proof establishes who is present; it does not by itself authorize a consequential operation.'],
        ['Authorization', 'Roles, ownership, policy and resource state remain server-enforced boundaries for privileged actions.'],
        ['Server-side privilege', 'Service-role credentials, provider secrets and privileged commands remain outside public browser authority.'],
        ['Data boundaries', 'Row-level security, ownership and service boundaries are used to constrain access according to the responsible subsystem.'],
        ['Idempotency and replay protection', 'Consequential operations are designed to resist accidental duplication and unsafe replay.'],
        ['Auditability', 'Identity, authorization and operational transitions are designed to remain attributable and reviewable.'],
        ['Fail-closed behavior', 'Missing credentials, unavailable dependencies or unverified capability must not become simulated success.'],
      ]}
    />
  );
}
