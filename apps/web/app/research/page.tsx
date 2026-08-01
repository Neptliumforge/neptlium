import type { Metadata } from 'next';
import { FoundationPage } from '@/components/foundation-page';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Neptlium research for considered ownership.',
  alternates: { canonical: '/research' },
};
const topics = [
  'Capital Allocation',
  'Portfolio Construction',
  'Digital Assets',
  'Public Markets',
  'Treasury and Liquidity',
  'Tokenized Ownership',
  'Artificial Intelligence',
  'Tokenization',
  'Financial Infrastructure',
  'Operational Risk',
  'Long-Term Ownership',
];

export default function Page() {
  return (
    <>
      <FoundationPage
        eyebrow="Research"
        title="Research for considered ownership."
        intro="A developing editorial environment for digital asset infrastructure, allocation structure, operating controls and long-term capital organization. Publications will be added only when ready for careful review."
        anchors={['Research approach', 'Taxonomy', 'Editorial index']}
        cards={topics.map((title) => ({
          title,
          body: `A category for considered work on ${title.toLowerCase()} and its relationship to modern ownership.`,
        }))}
        cta="Explore Learn"
        ctaHref="/learn"
      />
      <section className="border-t border-line bg-background py-16">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Search the archive</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Find research by topic.</h2>
            <form className="mt-6 flex gap-3" role="search">
              <label className="sr-only" htmlFor="research-search">
                Search research
              </label>
              <input
                id="research-search"
                name="q"
                placeholder="Search research"
                className="min-w-0 flex-1 rounded-md border border-line bg-background px-4 py-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
              <button className="button" type="submit">
                Search
              </button>
            </form>
            <p className="mt-4 text-sm text-muted">
              No publications are currently indexed. The taxonomy and search entry are ready for
              reviewed editorial content.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
