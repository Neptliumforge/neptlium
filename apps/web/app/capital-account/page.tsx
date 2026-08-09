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
      title="Capital needs an operating layer."
      intro="The Neptlium Capital Account is the account infrastructure through which supported digital capital can be organized and operated within explicit controls. Asset and network availability depends on production integrations and account eligibility."
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
      cta="Get started"
      ctaHref="https://app.neptlium.com/auth/sign-in"
    />
  );
}
