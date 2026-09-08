import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileText, Globe2, Landmark, MapPin, Phone, Scale, TrendingUp } from 'lucide-react';
import { Card } from '@neptlium/ui';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getComparableCompanies, getCompanyProfile } from '@/lib/company-intelligence';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ compare?: string }>;
};

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

function percent(value: number | null | undefined) {
  return typeof value === 'number' ? `${value.toFixed(1)}%` : '—';
}

function filingLabel(category: 'ANNUAL_REPORT' | 'QUARTERLY_REPORT' | 'EARNINGS_EVENT' | 'CURRENT_REPORT') {
  if (category === 'ANNUAL_REPORT') return 'Annual report';
  if (category === 'QUARTERLY_REPORT') return 'Quarterly report';
  if (category === 'EARNINGS_EVENT') return 'Earnings event';
  return 'Current report';
}

export default async function CompanyPage({ params, searchParams }: Props) {
  await requireUser();
  const [{ ticker }, { compare = '' }] = await Promise.all([params, searchParams]);
  const company = await getCompanyProfile(decodeURIComponent(ticker));
  if (!company) notFound();

  const compareTickers = compare.split(',').map((item) => item.trim().toUpperCase()).filter((item) => item && item !== company.ticker).slice(0, 4);
  const comparables = compareTickers.length ? await getComparableCompanies(compareTickers, company.sic) : [];

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
    <div className="space-y-7">
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
              {company.sicDescription || 'SEC-registered company'} · Primary-source company record, reported financial history and filing chronology assembled from SEC submissions and XBRL facts.
            </p>
          </div>
          <span className="w-fit rounded-full border border-border-hairline bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">Primary source · SEC</span>
        </div>
      </header>

      {company.metrics.length ? (
        <section aria-labelledby="reported-fundamentals-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="neptlium-meta">Reported fundamentals</p>
              <h2 id="reported-fundamentals-heading" className="mt-1 text-base font-semibold text-text-primary">Latest filed facts</h2>
            </div>
            <p className="hidden text-xs text-text-muted sm:block">Period and filing date preserved per metric</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {company.metrics.slice(0, 8).map((metric) => (
              <Card key={metric.key}>
                <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-text-primary">{money(metric.value, metric.unit)}</p>
                <div className="mt-4 space-y-1 text-[11px] text-text-muted">
                  <p>Period {metric.periodEnd}</p>
                  <p>{metric.form} filed {metric.filed}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {company.ratios.length ? (
        <section aria-labelledby="ratios-heading">
          <div className="mb-3">
            <p className="neptlium-meta">Derived operating context</p>
            <h2 id="ratios-heading" className="mt-1 text-base font-semibold text-text-primary">Governed ratios</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {company.ratios.map((ratio) => (
              <Card key={ratio.key}>
                <div className="flex items-center gap-2"><TrendingUp className="size-4 text-text-muted" aria-hidden="true" /><p className="text-xs font-medium text-text-secondary">{ratio.label}</p></div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{percent(ratio.value)}</p>
                <p className="mt-3 text-[11px] leading-5 text-text-muted">{ratio.periodEnd} · {ratio.basis}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {company.historicalPeriods.length ? (
        <section aria-labelledby="history-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div><p className="neptlium-meta">Historical financials</p><h2 id="history-heading" className="mt-1 text-base font-semibold text-text-primary">Annual reported periods</h2></div>
            <p className="hidden text-xs text-text-muted md:block">Latest five SEC-resolved annual period ends</p>
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="min-w-[920px] w-full text-left">
              <thead className="border-b border-border-hairline bg-surface-secondary text-[11px] uppercase tracking-[0.08em] text-text-muted">
                <tr><th className="px-4 py-3 font-medium">Period</th><th className="px-4 py-3 font-medium">Revenue</th><th className="px-4 py-3 font-medium">Gross profit</th><th className="px-4 py-3 font-medium">Operating income</th><th className="px-4 py-3 font-medium">Net income</th><th className="px-4 py-3 font-medium">Assets</th><th className="px-4 py-3 font-medium">Liabilities</th><th className="px-4 py-3 font-medium">Cash</th></tr>
              </thead>
              <tbody className="divide-y divide-border-hairline text-sm">
                {company.historicalPeriods.map((period) => (
                  <tr key={period.periodEnd}>
                    <td className="px-4 py-3"><p className="font-medium text-text-primary">{period.periodEnd}</p><p className="mt-1 text-[11px] text-text-muted">{period.form} · filed {period.filed}</p></td>
                    {[period.revenue, period.grossProfit, period.operatingIncome, period.netIncome, period.assets, period.liabilities, period.cash].map((metric, index) => <td key={index} className="px-4 py-3 tabular-nums text-text-secondary">{metric ? money(metric.value, metric.unit) : '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="comparables-heading">
        <div className="mb-3"><p className="neptlium-meta">Comparable context</p><h2 id="comparables-heading" className="mt-1 text-base font-semibold text-text-primary">User-directed peer set</h2></div>
        <Card>
          <form method="get" className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div><label htmlFor="compare" className="text-xs font-medium text-text-secondary">Comparable tickers</label><input id="compare" name="compare" defaultValue={compare} placeholder="GOOGL, META, AMZN" className="mt-2 h-10 w-full rounded-lg border border-border-hairline bg-surface-primary px-3 text-sm text-text-primary outline-none focus:border-text-muted" /><p className="mt-2 text-[11px] leading-5 text-text-muted">Up to four SEC-listed companies. Neptlium does not auto-declare peers; same-SIC matches are explicitly marked.</p></div>
            <button type="submit" className="h-10 rounded-lg border border-border-hairline bg-text-primary px-4 text-sm font-medium text-surface-primary">Compare</button>
          </form>

          {comparables.length ? (
            <div className="mt-5 overflow-x-auto border-t border-border-hairline pt-5">
              <table className="min-w-[800px] w-full text-left">
                <thead className="text-[11px] uppercase tracking-[0.08em] text-text-muted"><tr><th className="pb-3 font-medium">Company</th><th className="pb-3 font-medium">Industry context</th><th className="pb-3 font-medium">Revenue</th><th className="pb-3 font-medium">Revenue growth</th><th className="pb-3 font-medium">Net margin</th><th className="pb-3 font-medium">Assets</th></tr></thead>
                <tbody className="divide-y divide-border-hairline text-sm">
                  {comparables.map((peer) => <tr key={peer.cik}><td className="py-3"><p className="font-medium text-text-primary">{peer.name}</p><p className="mt-1 text-xs text-text-muted">{peer.ticker}{peer.exchange ? ` · ${peer.exchange}` : ''}</p></td><td className="py-3"><div className="flex items-center gap-2"><Scale className="size-4 text-text-muted" aria-hidden="true" /><span className="text-text-secondary">{peer.sameSic ? 'Same SIC' : 'User-selected'}</span></div><p className="mt-1 max-w-[220px] truncate text-xs text-text-muted">{peer.sicDescription || 'Classification unavailable'}</p></td><td className="py-3 tabular-nums text-text-secondary">{peer.latestRevenue ? money(peer.latestRevenue.value, peer.latestRevenue.unit) : '—'}</td><td className="py-3 tabular-nums text-text-secondary">{percent(peer.revenueGrowth?.value)}</td><td className="py-3 tabular-nums text-text-secondary">{percent(peer.netMargin?.value)}</td><td className="py-3 tabular-nums text-text-secondary">{peer.latestAssets ? money(peer.latestAssets.value, peer.latestAssets.unit) : '—'}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <div className="flex items-center gap-2"><Landmark className="size-4 text-text-secondary" aria-hidden="true" /><h2 className="text-sm font-semibold text-text-primary">Company identity</h2></div>
          <dl className="mt-5 divide-y divide-border-hairline">
            {detailRows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"><dt className="text-xs font-medium text-text-muted">{label}</dt><dd className="text-sm text-text-primary">{value}</dd></div>)}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary">Operating coordinates</h2>
          <div className="mt-5 space-y-4 text-sm">
            {company.headquarters ? <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div><p className="text-xs font-medium text-text-muted">Headquarters</p><p className="mt-1 leading-6 text-text-primary">{company.headquarters}</p></div></div> : null}
            {company.phone ? <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div><p className="text-xs font-medium text-text-muted">Phone</p><p className="mt-1 text-text-primary">{company.phone}</p></div></div> : null}
            {company.website ? <div className="flex gap-3"><Globe2 className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" /><div className="min-w-0"><p className="text-xs font-medium text-text-muted">Company website</p><a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-text-primary underline decoration-border-hairline underline-offset-4 hover:decoration-text-primary">{company.website}<ExternalLink className="size-3" aria-hidden="true" /></a></div></div> : null}
          </div>
        </Card>
      </section>

      <section aria-labelledby="timeline-heading">
        <div className="mb-3"><p className="neptlium-meta">Filing & earnings chronology</p><h2 id="timeline-heading" className="mt-1 text-base font-semibold text-text-primary">Material timeline</h2></div>
        <Card className="overflow-hidden p-0">
          {company.filings.length ? <div className="divide-y divide-border-hairline">{company.filings.map((filing) => (
            <a key={filing.accessionNumber} href={filing.url} target="_blank" rel="noreferrer" className="group grid gap-3 px-4 py-4 transition hover:bg-surface-secondary sm:grid-cols-[110px_150px_minmax(0,1fr)_auto] sm:items-center sm:px-5">
              <span className="text-xs tabular-nums text-text-muted">{filing.filingDate}</span><span className="w-fit rounded-full border border-border-hairline bg-surface-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary">{filingLabel(filing.category)}</span><div className="min-w-0"><div className="flex flex-wrap items-baseline gap-2"><p className="text-sm font-semibold text-text-primary">{filing.form}</p>{filing.reportDate ? <span className="text-xs text-text-muted">Period {filing.reportDate}</span> : null}</div><p className="mt-1 truncate text-xs text-text-muted">Accession {filing.accessionNumber}{filing.items.length ? ` · Items ${filing.items.join(', ')}` : ''}</p></div><ExternalLink className="size-4 text-text-muted group-hover:text-text-primary" aria-hidden="true" />
            </a>
          ))}</div> : <div className="px-5 py-8 text-sm text-text-secondary">No recent material filing was resolved from the SEC submissions feed.</div>}
        </Card>
      </section>

      {company.formerNames.length ? <Card><p className="neptlium-meta">Identity history</p><h2 className="mt-1 text-sm font-semibold text-text-primary">Former legal names</h2><div className="mt-4 divide-y divide-border-hairline">{company.formerNames.map((item) => <div key={`${item.name}-${item.from}-${item.to}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-text-primary">{item.name}</span><span className="text-xs text-text-muted">{item.from || '—'} → {item.to || '—'}</span></div>)}</div></Card> : null}

      <footer className="border-t border-border-hairline pt-4 text-xs leading-5 text-text-muted">
        SEC identity and filing data are primary-source records. Historical facts and derived ratios depend on issuer XBRL taxonomy and period alignment; missing or non-aligning observations remain unresolved. Comparable companies are user-selected, not investment recommendations or automatically inferred peers.
      </footer>
    </div>
  );
}
