import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { searchCompanies } from '@/lib/company-intelligence';
import { WorkspaceHeader } from '@/components/product/WorkspaceHeader';

export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ q?: string }> };

const foundations = [
  {
    title: 'Identity',
    question: 'Who is the company?',
    detail: 'Legal identity, corporate classification, and reporting identity.',
  },
  {
    title: 'Financial Position',
    question: 'What is reported?',
    detail: 'Revenue, assets, liabilities, equity, and available financial evidence.',
  },
  {
    title: 'Evidence',
    question: 'Where does information come from?',
    detail: 'Company filings, disclosures, and primary sources.',
  },
] as const;

export default async function ResearchPage({ searchParams }: Props) {
  await requireUser();
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = query ? await searchCompanies(query) : [];

  return (
    <div className="space-y-10 lg:space-y-12">
      <WorkspaceHeader
        eyebrow="Verified company understanding"
        title="Company Intelligence"
        description="Understand companies through verified identity, financial evidence, and primary sources."
        meta="Neptlium establishes a trusted company foundation before deeper intelligence and strategic analysis."
      />

      <section
        aria-labelledby="find-company-title"
        className="border-y border-border-hairline py-7 sm:py-9"
      >
        <div className="max-w-3xl">
          <p className="neptlium-meta">Resolve</p>
          <h2
            id="find-company-title"
            className="mt-2 text-xl font-medium tracking-[-0.02em] text-text-primary"
          >
            Find a company
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Search by company name, ticker, or identifier.
          </p>
          <form
            action="/dashboard/company-intelligence"
            method="get"
            className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label htmlFor="company-search" className="sr-only">
              Search company, ticker, or identifier
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                id="company-search"
                name="q"
                defaultValue={query}
                autoComplete="off"
                placeholder="Search company, ticker, or identifier"
                className="h-12 w-full border border-border-default bg-surface-1 pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-text-primary focus:ring-2 focus:ring-border-hairline"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 bg-text-primary px-5 text-sm font-medium text-surface-primary transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-text-muted focus:ring-offset-2"
            >
              Resolve Company <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-3 text-xs text-text-muted">Try Microsoft, MSFT, Tesla, or TSLA.</p>
        </div>
      </section>

      {!query ? (
        <section
          aria-labelledby="begin-company-title"
          className="grid gap-8 border-b border-border-hairline pb-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start"
        >
          <div>
            <p className="neptlium-meta">Company Intelligence</p>
            <h2
              id="begin-company-title"
              className="mt-3 text-2xl font-medium tracking-[-0.025em] text-text-primary"
            >
              Begin with a company.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">
              Resolve an organization to understand its identity, financial position, and primary
              evidence.
            </p>
          </div>
          <div className="grid border-y border-border-hairline sm:grid-cols-3">
            {['Identity', 'Financials', 'Filings'].map((item, index) => (
              <div
                key={item}
                className="border-b border-border-hairline py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0"
              >
                <span className="text-[11px] tabular-nums text-accent-primary">0{index + 1}</span>
                <p className="mt-3 text-sm font-medium text-text-primary">{item}</p>
                <p className="mt-2 text-xs leading-5 text-text-muted">
                  Awaiting company resolution
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="company-results-title">
          <div className="mb-4">
            <p className="neptlium-meta">Company profile</p>
            <h2 id="company-results-title" className="mt-2 text-lg font-medium text-text-primary">
              {results.length
                ? `${results.length} verified ${results.length === 1 ? 'identity' : 'identities'}`
                : 'No company resolved'}
            </h2>
          </div>
          <div className="border-y border-border-hairline">
            {results.length ? (
              results.map((company) => (
                <Link
                  key={`${company.cik}-${company.ticker}`}
                  href={`/dashboard/company-intelligence/company/${encodeURIComponent(company.ticker)}`}
                  className="group grid gap-3 border-b border-border-hairline py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{company.name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Corporate identity verified through SEC records
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{company.ticker}</p>
                    <p className="mt-1 text-xs text-text-muted">CIK confirmed</p>
                  </div>
                  <ArrowRight
                    className="size-4 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-text-primary"
                    aria-hidden="true"
                  />
                </Link>
              ))
            ) : (
              <div className="py-8">
                <p className="text-sm font-medium text-text-primary">
                  No verified company matched “{query}”.
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Try a legal company name or listed ticker.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="intelligence-foundation-title">
        <div className="mb-5">
          <p className="neptlium-meta">Research foundation</p>
          <h2
            id="intelligence-foundation-title"
            className="mt-2 text-xl font-medium text-text-primary"
          >
            Intelligence Foundation
          </h2>
          <p className="mt-2 text-sm text-text-muted">Before opinions, understand the facts.</p>
        </div>
        <div className="grid border-y border-border-hairline sm:grid-cols-3">
          {foundations.map((item) => (
            <article
              key={item.title}
              className="border-b border-border-hairline py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0"
            >
              <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
              <p className="mt-3 text-xs font-medium text-text-secondary">{item.question}</p>
              <p className="mt-2 text-xs leading-5 text-text-muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
