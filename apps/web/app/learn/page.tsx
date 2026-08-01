import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';
export const metadata: Metadata = {
  title: 'Learn',
  description: 'A structured learning center for modern ownership.',
  alternates: { canonical: '/learn' },
};
const topics = [
  'Portfolio Basics',
  'Capital Allocation',
  'Investment Risk',
  'Liquidity',
  'Treasury',
  'Digital Assets',
  'Tokenization',
  'Diversification',
  'Portfolio Roles',
  'Long-Term Ownership',
];
export default function Page() {
  return (
    <FoundationPage
      eyebrow="Learn"
      title="Build understanding before making decisions."
      intro="A structured learning center for the concepts that shape modern ownership. Lessons are organized by topic and designed to clarify the relationship between portfolio purpose, risk, liquidity and control."
      anchors={['Learning approach', 'Topics', 'Navigation']}
      cards={topics.map((title) => ({
        title,
        body: `A dedicated learning path for ${title.toLowerCase()}, with definitions, context and practical questions to consider. Content will be published only when it is ready for careful review.`,
      }))}
      cta="Explore the platform"
      ctaHref="/platform"
    />
  );
}
