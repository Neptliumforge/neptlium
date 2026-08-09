import type { Metadata } from 'next';
import { DetailPage } from '@/components/detail-page';

export const metadata: Metadata = {
  title: 'Research | Neptlium',
  description: 'Neptlium perspectives on capital structure, allocation, ownership and infrastructure risk.',
  alternates: { canonical: '/research' },
};

export default function Page() {
  return (
    <DetailPage
      eyebrow="Neptlium Research"
      title="Thinking for a changing capital system."
      intro="Research will examine the structures shaping digital ownership. No publications are available yet."
      sections={[
        ['Capital Structure', 'How assets, liquidity and strategic roles form a coherent portfolio.'],
        ['Allocation Systems', 'How modeling and authorization can remain distinct from execution.'],
        ['Digital Ownership', 'How network-native assets change account and operating boundaries.'],
        ['Treasury Architecture', 'How liquidity, reserves and readiness shape capital decisions.'],
        ['Infrastructure Risk', 'How provider, network and operational dependencies affect capital systems.'],
      ]}
    />
  );
}
