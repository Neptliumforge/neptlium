import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';

export const metadata: Metadata = {
  title: 'Learn | Neptlium',
  description: 'Clear explanations of the concepts behind capital accounts, portfolios, treasury and allocation.',
  alternates: { canonical: '/learn' },
};

export default function Page() {
  return (
    <FoundationPage
      title="Understand the system before using it."
      intro="Clear definitions for the concepts that shape capital organization and control."
      anchors={['Foundations', 'Concepts', 'Platform']}
      lead={[
        'A practical capital vocabulary.',
        'Learn distinguishes what capital is, how it is positioned and when a decision becomes an action.',
      ]}
      cards={[
        ['Capital Account', 'Account infrastructure for supported assets and networks.'],
        ['Portfolio Intelligence', 'A connected view of composition, concentration, liquidity and structure.'],
        ['Treasury', 'The relationship between available capital, reserves and readiness.'],
        ['Allocation', 'The deliberate assignment of capital to defined portfolio roles.'],
        ['Reserve and liquidity', 'Capital preserved for resilience, and capital that can be acted on.'],
        ['Modeling and execution', 'Modeling explores a possible structure. Execution changes capital.'],
        ['Authorization', 'The explicit approval boundary before a consequential action.'],
      ].map(([title, body]) => ({ title, body }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
