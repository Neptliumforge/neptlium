import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileText, Globe2, Landmark, MapPin, Phone } from 'lucide-react';
import { Card } from '@neptlium/ui';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getCompanyProfile } from '@/lib/company-intelligence';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ ticker: string }> };

function money(value: number, unit: string) {
  if (unit !== 'USD') return `${value.toLocaleString()} ${unit}`;
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${value < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(2)}M`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function identityValue(value: string | null) {
  return value || 'Not reported';
}

export default async function CompanyPage({ params }: Props) {
  await requireUser();
  const { ticker } = await params;
  const company = await getCompanyProfile(decodeURIComponent(ticker));
  if (!company) notFound();

  const detailRows = [
    ['Legal name', company.name],
    ['Ticker', company.ticker],
    ['Exchange', identityValue(company.exchange)],
    ['CIK', company.cik],
    ['SIC', company.sic ? `${company.sic} · ${identityValue(company.sicDescription)}` : identityValue(company.sicDescription)],
    ['State of incorporation', identityValue(company.stateOfIncorporation)],
    ['Fiscal year end', identityValue(company.fiscalYearEnd)],
  ] as const;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/research" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Company intelligence
      </Link>

      <header className="border-b border-border-hairline pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary">
              <span>{company.ticker}</span>
              {company.exchange ? <><span aria-hidden="true">·</span><span>{company.exchange}</span></> : null}
              <span aria-hidden="true">·</span>
              <span>CIK {company.cik}</span>
            </div>
            <h1 className="mt-2 truncate text-[1.8rem] font-semibold leading-tight tracking-[-0.03em] text-text-primary sm:text-4xl">{company.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
              {company.sicDescription || 'SEC-registered company'} · Primary-source company record assembled from SEC submissions and XBRL company facts.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-border-hairline bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">Primary source · SEC</span>
          </div>
        </div>
      </header>

      {company.metrics.length ? (
        <section aria-labelledby="reported-fundamentals-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="neptlium-meta">Reported fundamentals</p>
              <h2 id="reported-fundamentals-heading" className="mt-1 text-base font-semibold text-text-primary">Latest filed facts</h2>
            </div>
            <p className="hidden text-xs text-text-muted sm:block">Period and filing date shown per metric</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {company.metrics.map((metric) => (
              <Card key={metric.key}>
                <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-text-primary">{money(metric.value, metric.unit)}</p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-muted">
                  <span>Period {metric.periodEnd}</span>
                  <span>{metric.form} filed {metric.filed}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-text-secondary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-text-primary">Company identity</h2>
          </div>
          <dl className="mt-5 divide-y divide-border-hairline">
            {detailRows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <dt className="text-xs font-medium text-text-muted">{label}</dt>
                <dd className="text-sm text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary">Operating coordinates</h2>
          <div className="mt-5 space-y-4 text-sm">
            {company.headquarters ? (
              <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div><p className="text-xs font-medium text-text-muted">Headquarters</p><p className="mt-1 leading-6 text-text-primary">{company.headquarters}</p></div></div>
            ) : null}
            {company.phone ? (
              <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div><p className="text-xs font-medium text-text-muted">Phone</p><p className="mt-1 text-text-primary">{company.phone}</p></div></div>
            ) : null}
            {company.website ? (
              <div className="flex gap-3"><Globe2 className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div className="min-w-0"><p className="text-xs font-medium text-text-muted">Company website</p><a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-text-primary underline decoration-border-hairline underline-offset-4 hover:decoration-text-primary">{company.website}<ExternalLink className="size-3" aria-hidden="true" /></a></div></div>
            ) : null}
          </div>
        </Card>
      </section>

      <section aria-labelledby="filings-heading">
        <div className="mb-3">
          <p className="neptlium-meta">Primary evidence</p>
          <h2 id="filings-heading" className="mt-1 text-base font-semibold text-text-primary">Recent material filings</h2>
        </div>
        <Card className="overflow-hidden p-0">
          {company.filings.length ? (
            <div className="divide-y divide-border-hairline">
              {company.filings.map((filing) => (
                <a key={filing.accessionNumber} href={filing.url} target="_blank" rel="noreferrer" className="group flex items-center gap-4 px-4 py-4 transition hover:bg-surface-secondary sm:px-5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-hairline bg-surface-secondary"><FileText className="size-4 text-text-secondary" aria-hidden="true" /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="text-sm font-semibold text-text-primary">{filing.form}</p><span className="text-xs text-text-secondary">Filed {filing.filingDate}</span>{filing.reportDate ? <span className="text-xs text-text-muted">Period {filing.reportDate}</span> : null}</div><p className="mt-1 truncate text-xs text-text-muted">Accession {filing.accessionNumber}</p></div>
                  <ExternalLink className="size-4 shrink-0 text-text-muted transition group-hover:text-text-primary" aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : <div className="px-5 py-8 text-sm text-text-secondary">No recent material filing was resolved from the SEC submissions feed.</div>}
        </Card>
      </section>

      {company.formerNames.length ? (
        <Card>
          <p className="neptlium-meta">Identity history</p>
          <h2 className="mt-1 text-sm font-semibold text-text-primary">Former legal names</h2>
          <div className="mt-4 divide-y divide-border-hairline">
            {company.formerNames.map((item) => <div key={`${item.name}-${item.from}-${item.to}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-text-primary">{item.name}</span><span className="text-xs text-text-muted">{item.from || '—'} → {item.to || '—'}</span></div>)}
          </div>
        </Card>
      ) : null}

      <footer className="border-t border-border-hairline pt-4 text-xs leading-5 text-text-muted">
        SEC identity and filing data are primary-source records. Reported facts are selected from filed XBRL observations and may differ by taxonomy tag or reporting basis across issuers. Neptlium does not infer missing company facts on this surface.
      </footer>
    </div>
  );
}
