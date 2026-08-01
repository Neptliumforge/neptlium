import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Capital Account',
  description: 'A governed account foundation for supported capital operations.',
  alternates: { canonical: '/capital-account' },
};
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Capital Account"
      title="One account for the movement of capital."
      intro="Capital Account is the operational foundation through which eligible users can fund, hold, transfer and deploy supported capital across the Neptlium environment. Capabilities vary by jurisdiction, eligibility, provider coverage and account type."
      anchors={['Account foundation', 'Governed operations', 'Availability']}
      cards={[
        [
          'Fund and hold',
          'Organize supported capital and maintain an understandable view of available and pending positions.',
        ],
        [
          'Transfer and deploy',
          'Connect capital movement with explicit authorization and the wider portfolio mandate.',
        ],
        [
          'Review activity',
          'Keep a complete operating view of account events without reducing ownership to a trading balance.',
        ],
      ].map(([title, body]) => ({ title, body }))}
      cta="Access Neptlium"
      ctaHref="https://app.neptlium.com/auth/sign-in"
    />
  );
}
