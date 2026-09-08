import Link from 'next/link';
import { ArrowRight, Building2, Search } from 'lucide-react';
import { Card } from '@neptlium/ui';
import { requireUser } from '@/lib/auth';
import { searchCompanies } from '@/lib/company-intelligence';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ResearchPage({ searchParams }: Props) {
  await requireUser();
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = query.length >= 1 ? await searchCompanies(query) : [];

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="neptlium-meta">Research · Company intelligence</p>
        <h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-[-0.025em] text-text-primary sm:text-3xl">
          Company intelligence
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Resolve a company to its canonical SEC identity, reported financial facts and primary filings before any thesis evaluation is applied.
        </p>
      </header>

      <Card>
        <form action="/dashboard/research" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="company-search" className="sr-only">Search company name or ticker</label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              id="company-search"
              name="q"
              defaultValue={query}
              autoComplete="off"
              placeholder="Search company or ticker — e.g. Microsoft, MSFT"
              className="h-11 w-full rounded-lg border border-border-hairline bg-surface-primary pl-10 pr-4 text-sm text-text-primary outline-none transition focus:border-text-muted focus:ring-2 focus:ring-border-hairline"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-text-primary px-5 text-sm font-medium text-surface-primary transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-text-muted focus:ring-offset-2"
          >
            Resolve company
          </button>
        </form>
      </Card>

      {!query ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ['Canonical identity', 'Ticker, CIK, exchange, incorporation and industry classification from SEC records.'],
            ['Reported fundamentals', 'Revenue, net income, assets, liabilities, cash and equity from filed XBRL facts.'],
            ['Primary evidence', 'Recent 10-K, 10-Q, 8-K and foreign issuer filings link directly to EDGAR source documents.'],
          ].map(([title, description]) => (
            <Card key={title}>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border-hairline bg-surface-secondary">
                <Building2 className="size-4 text-text-secondary" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-text-primary">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </Card>
          ))}
        </section>
      ) : (
        <section aria-labelledby="company-results-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="neptlium-meta">Resolved universe</p>
              <h2 id="company-results-heading" className="mt-1 text-base font-semibold text-text-primary">
                {results.length ? `${results.length} matching ${results.length === 1 ? 'company' : 'companies'}` : 'No company resolved'}
              </h2>
            </div>
            <p className="hidden text-xs text-text-muted sm:block">Source: SEC listed-company registry</p>
          </div>

          <Card className="overflow-hidden p-0">
            {results.length ? (
              <div className="divide-y divide-border-hairline">
                {results.map((company) => (
                  <Link
                    key={`${company.cik}-${company.ticker}`}
                    href={`/dashboard/research/company/${encodeURIComponent(company.ticker)}`}
                    className="group flex items-center gap-4 px-4 py-4 transition hover:bg-surface-secondary sm:px-5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-hairline bg-surface-secondary text-xs font-semibold text-text-primary">
                      {company.ticker.slice(0, 4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="truncate text-sm font-semibold text-text-primary">{company.name}</p>
                        <span className="shrink-0 text-xs font-medium text-text-secondary">{company.ticker}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">CIK {company.cik}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-text-primary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-text-primary">No SEC-listed company matched “{query}”.</p>
                <p className="mt-2 text-sm text-text-secondary">Try a legal company name or exchange ticker.</p>
              </div>
            )}
          </Card>
        </section>
      )}
    </div>
  );
}
