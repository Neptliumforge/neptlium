export type CompanySearchResult = {
  cik: string;
  ticker: string;
  name: string;
};

export type CompanyMetric = {
  key: string;
  label: string;
  value: number;
  unit: string;
  periodEnd: string;
  filed: string;
  form: string;
  sourceTag: string;
};

export type CompanyHistoricalPeriod = {
  periodEnd: string;
  fiscalYear: number | null;
  form: string;
  filed: string;
  revenue: CompanyMetric | null;
  grossProfit: CompanyMetric | null;
  operatingIncome: CompanyMetric | null;
  netIncome: CompanyMetric | null;
  assets: CompanyMetric | null;
  liabilities: CompanyMetric | null;
  cash: CompanyMetric | null;
  equity: CompanyMetric | null;
};

export type CompanyRatio = {
  key: string;
  label: string;
  value: number;
  unit: 'PERCENTAGE';
  periodEnd: string;
  basis: string;
};

export type CompanyFilingCategory = 'ANNUAL_REPORT' | 'QUARTERLY_REPORT' | 'EARNINGS_EVENT' | 'CURRENT_REPORT';

export type CompanyFiling = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string | null;
  form: string;
  primaryDocument: string;
  items: readonly string[];
  category: CompanyFilingCategory;
  url: string;
};

export type ComparableCompanyProfile = {
  cik: string;
  ticker: string;
  name: string;
  exchange: string | null;
  sic: string | null;
  sicDescription: string | null;
  sameSic: boolean;
  latestRevenue: CompanyMetric | null;
  latestNetIncome: CompanyMetric | null;
  latestAssets: CompanyMetric | null;
  revenueGrowth: CompanyRatio | null;
  netMargin: CompanyRatio | null;
};

export type CompanyProfile = {
  cik: string;
  ticker: string;
  exchange: string | null;
  name: string;
  sic: string | null;
  sicDescription: string | null;
  fiscalYearEnd: string | null;
  stateOfIncorporation: string | null;
  phone: string | null;
  website: string | null;
  investorWebsite: string | null;
  headquarters: string | null;
  mailingAddress: string | null;
  formerNames: readonly { name: string; from: string | null; to: string | null }[];
  metrics: readonly CompanyMetric[];
  historicalPeriods: readonly CompanyHistoricalPeriod[];
  ratios: readonly CompanyRatio[];
  filings: readonly CompanyFiling[];
  source: {
    authority: 'SEC';
    retrievedAt: string;
    submissionsUrl: string;
    factsUrl: string;
  };
};

const SEC_BASE = 'https://data.sec.gov';
const SEC_WWW = 'https://www.sec.gov';
const USER_AGENT = process.env.NEPTLIUM_SEC_USER_AGENT ?? 'Neptlium/1.0 contact@neptlium.com';
const ANNUAL_FORMS = new Set(['10-K', '20-F', '40-F']);
const PERIODIC_FORMS = new Set(['10-K', '10-Q', '20-F', '40-F']);

async function secFetch<T>(url: string, revalidate = 3600): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`SEC source unavailable (${response.status})`);
  return response.json() as Promise<T>;
}

function padCik(cik: string | number) {
  return String(cik).replace(/\D/g, '').padStart(10, '0');
}

function compactCik(cik: string | number) {
  return String(Number(String(cik).replace(/\D/g, '')));
}

function addressLine(address: Record<string, unknown> | null | undefined) {
  if (!address) return null;
  return [address.street1, address.street2, address.city, address.stateOrCountry, address.zipCode]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ') || null;
}

type TickerIndex = Record<string, { cik_str: number; ticker: string; title: string }>;

export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const index = await secFetch<TickerIndex>(`${SEC_WWW}/files/company_tickers.json`, 86_400);
  return Object.values(index)
    .filter((item) => item.ticker.toLowerCase().includes(normalized) || item.title.toLowerCase().includes(normalized))
    .sort((a, b) => {
      const aExact = a.ticker.toLowerCase() === normalized ? 0 : 1;
      const bExact = b.ticker.toLowerCase() === normalized ? 0 : 1;
      return aExact - bExact || a.title.localeCompare(b.title);
    })
    .slice(0, 12)
    .map((item) => ({ cik: padCik(item.cik_str), ticker: item.ticker.toUpperCase(), name: item.title }));
}

async function resolveTicker(ticker: string): Promise<CompanySearchResult | null> {
  const normalized = ticker.trim().toUpperCase();
  const index = await secFetch<TickerIndex>(`${SEC_WWW}/files/company_tickers.json`, 86_400);
  const match = Object.values(index).find((item) => item.ticker.toUpperCase() === normalized);
  return match ? { cik: padCik(match.cik_str), ticker: match.ticker.toUpperCase(), name: match.title } : null;
}

type SecSubmissions = {
  cik: string;
  entityType?: string;
  sic?: string;
  sicDescription?: string;
  name: string;
  tickers?: string[];
  exchanges?: string[];
  fiscalYearEnd?: string;
  stateOfIncorporation?: string;
  phone?: string;
  website?: string;
  investorWebsite?: string;
  addresses?: {
    business?: Record<string, unknown>;
    mailing?: Record<string, unknown>;
  };
  formerNames?: { name?: string; from?: string; to?: string }[];
  filings?: {
    recent?: {
      accessionNumber?: string[];
      filingDate?: string[];
      reportDate?: string[];
      form?: string[];
      primaryDocument?: string[];
      items?: string[];
    };
  };
};

type FactUnit = {
  val?: number;
  start?: string;
  end?: string;
  filed?: string;
  form?: string;
  fp?: string;
  fy?: number;
  accn?: string;
};
type SecFacts = { facts?: { 'us-gaap'?: Record<string, { units?: Record<string, FactUnit[]> }> } };

const metricCandidates = [
  { key: 'revenue', label: 'Revenue', tags: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'] },
  { key: 'gross_profit', label: 'Gross profit', tags: ['GrossProfit'] },
  { key: 'operating_income', label: 'Operating income', tags: ['OperatingIncomeLoss'] },
  { key: 'net_income', label: 'Net income', tags: ['NetIncomeLoss'] },
  { key: 'assets', label: 'Total assets', tags: ['Assets'] },
  { key: 'liabilities', label: 'Total liabilities', tags: ['Liabilities'] },
  { key: 'cash', label: 'Cash & equivalents', tags: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'] },
  { key: 'equity', label: 'Stockholders’ equity', tags: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'] },
] as const;

type MetricCandidate = (typeof metricCandidates)[number];

function factRows(facts: SecFacts, candidate: MetricCandidate, annualOnly = false): CompanyMetric[] {
  const gaap = facts.facts?.['us-gaap'] ?? {};
  for (const tag of candidate.tags) {
    const units = gaap[tag]?.units;
    if (!units) continue;
    const preferredUnit = units.USD ? 'USD' : Object.keys(units)[0];
    if (!preferredUnit) continue;
    const forms = annualOnly ? ANNUAL_FORMS : PERIODIC_FORMS;
    const rows = (units[preferredUnit] ?? [])
      .filter((row) => typeof row.val === 'number' && row.end && row.filed && forms.has(row.form ?? ''))
      .filter((row) => !annualOnly || row.fp === 'FY' || ANNUAL_FORMS.has(row.form ?? ''))
      .sort((a, b) => String(b.filed).localeCompare(String(a.filed)) || String(b.end).localeCompare(String(a.end)));
    if (!rows.length) continue;

    const byEnd = new Map<string, FactUnit>();
    for (const row of rows) {
      if (!row.end || byEnd.has(row.end)) continue;
      byEnd.set(row.end, row);
    }
    return Array.from(byEnd.values()).map((row) => ({
      key: candidate.key,
      label: candidate.label,
      value: row.val as number,
      unit: preferredUnit,
      periodEnd: row.end as string,
      filed: row.filed as string,
      form: row.form as string,
      sourceTag: tag,
    }));
  }
  return [];
}

function latestMetric(facts: SecFacts, candidate: MetricCandidate): CompanyMetric | null {
  return factRows(facts, candidate, false)[0] ?? null;
}

function metricByKey(facts: SecFacts, key: MetricCandidate['key'], annualOnly = true) {
  const candidate = metricCandidates.find((item) => item.key === key);
  return candidate ? factRows(facts, candidate, annualOnly) : [];
}

function buildHistoricalPeriods(facts: SecFacts): CompanyHistoricalPeriod[] {
  const series = new Map<MetricCandidate['key'], CompanyMetric[]>();
  for (const candidate of metricCandidates) series.set(candidate.key, factRows(facts, candidate, true));

  const periodEnds = Array.from(new Set(Array.from(series.values()).flatMap((rows) => rows.map((row) => row.periodEnd))))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 5);

  const lookup = (key: MetricCandidate['key'], end: string) => series.get(key)?.find((row) => row.periodEnd === end) ?? null;
  return periodEnds.map((periodEnd) => {
    const available = Array.from(series.values()).flatMap((rows) => rows).filter((row) => row.periodEnd === periodEnd);
    const anchor = available.sort((a, b) => b.filed.localeCompare(a.filed))[0] ?? null;
    return {
      periodEnd,
      fiscalYear: periodEnd ? Number(periodEnd.slice(0, 4)) : null,
      form: anchor?.form ?? '—',
      filed: anchor?.filed ?? '—',
      revenue: lookup('revenue', periodEnd),
      grossProfit: lookup('gross_profit', periodEnd),
      operatingIncome: lookup('operating_income', periodEnd),
      netIncome: lookup('net_income', periodEnd),
      assets: lookup('assets', periodEnd),
      liabilities: lookup('liabilities', periodEnd),
      cash: lookup('cash', periodEnd),
      equity: lookup('equity', periodEnd),
    };
  });
}

function pct(value: number) {
  return Math.round(value * 10_000) / 100;
}

function buildRatios(facts: SecFacts): CompanyRatio[] {
  const revenue = metricByKey(facts, 'revenue');
  const grossProfit = metricByKey(facts, 'gross_profit');
  const operatingIncome = metricByKey(facts, 'operating_income');
  const netIncome = metricByKey(facts, 'net_income');
  const assets = metricByKey(facts, 'assets');
  const liabilities = metricByKey(facts, 'liabilities');
  const cash = metricByKey(facts, 'cash');
  const ratios: CompanyRatio[] = [];

  const latestRevenue = revenue[0];
  const priorRevenue = latestRevenue ? revenue.find((item) => item.periodEnd < latestRevenue.periodEnd) : undefined;
  if (latestRevenue && priorRevenue && priorRevenue.value !== 0) {
    ratios.push({ key: 'revenue_growth_yoy', label: 'Revenue growth', value: pct(latestRevenue.value / priorRevenue.value - 1), unit: 'PERCENTAGE', periodEnd: latestRevenue.periodEnd, basis: `${latestRevenue.sourceTag} vs prior annual period` });
  }

  const ratioFromSamePeriod = (key: string, label: string, numerator: CompanyMetric | undefined, denominator: CompanyMetric | undefined, basis: string) => {
    if (!numerator || !denominator || numerator.periodEnd !== denominator.periodEnd || denominator.value === 0) return;
    ratios.push({ key, label, value: pct(numerator.value / denominator.value), unit: 'PERCENTAGE', periodEnd: denominator.periodEnd, basis });
  };

  ratioFromSamePeriod('gross_margin', 'Gross margin', grossProfit[0], latestRevenue, 'Gross profit / revenue');
  ratioFromSamePeriod('operating_margin', 'Operating margin', operatingIncome[0], latestRevenue, 'Operating income / revenue');
  ratioFromSamePeriod('net_margin', 'Net margin', netIncome[0], latestRevenue, 'Net income / revenue');
  ratioFromSamePeriod('liabilities_to_assets', 'Liabilities / assets', liabilities[0], assets[0], 'Total liabilities / total assets');
  ratioFromSamePeriod('cash_to_assets', 'Cash / assets', cash[0], assets[0], 'Cash and equivalents / total assets');
  return ratios;
}

function classifyFiling(form: string, items: readonly string[]): CompanyFilingCategory {
  if (ANNUAL_FORMS.has(form)) return 'ANNUAL_REPORT';
  if (form === '10-Q') return 'QUARTERLY_REPORT';
  if ((form === '8-K' || form === '6-K') && items.some((item) => item.split(',').map((part) => part.trim()).includes('2.02'))) return 'EARNINGS_EVENT';
  return 'CURRENT_REPORT';
}

export async function getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
  const identity = await resolveTicker(ticker);
  if (!identity) return null;
  const cik = padCik(identity.cik);
  const submissionsUrl = `${SEC_BASE}/submissions/CIK${cik}.json`;
  const factsUrl = `${SEC_BASE}/api/xbrl/companyfacts/CIK${cik}.json`;
  const [submissions, facts] = await Promise.all([
    secFetch<SecSubmissions>(submissionsUrl, 3600),
    secFetch<SecFacts>(factsUrl, 3600),
  ]);

  const recent = submissions.filings?.recent;
  const filings: CompanyFiling[] = [];
  const accessionNumbers = recent?.accessionNumber ?? [];
  for (let index = 0; index < accessionNumbers.length && filings.length < 24; index += 1) {
    const form = recent?.form?.[index] ?? '';
    if (!['10-K', '10-Q', '8-K', '20-F', '6-K', '40-F'].includes(form)) continue;
    const accessionNumber = accessionNumbers[index] ?? '';
    const primaryDocument = recent?.primaryDocument?.[index] ?? '';
    if (!accessionNumber || !primaryDocument) continue;
    const accessionCompact = accessionNumber.replace(/-/g, '');
    const items = (recent?.items?.[index] ?? '').split(',').map((item) => item.trim()).filter(Boolean);
    filings.push({
      accessionNumber,
      filingDate: recent?.filingDate?.[index] ?? '',
      reportDate: recent?.reportDate?.[index] || null,
      form,
      primaryDocument,
      items,
      category: classifyFiling(form, items),
      url: `${SEC_WWW}/Archives/edgar/data/${compactCik(cik)}/${accessionCompact}/${primaryDocument}`,
    });
  }

  return {
    cik,
    ticker: (submissions.tickers?.[0] ?? identity.ticker).toUpperCase(),
    exchange: submissions.exchanges?.[0] ?? null,
    name: submissions.name || identity.name,
    sic: submissions.sic ?? null,
    sicDescription: submissions.sicDescription ?? null,
    fiscalYearEnd: submissions.fiscalYearEnd ?? null,
    stateOfIncorporation: submissions.stateOfIncorporation ?? null,
    phone: submissions.phone ?? null,
    website: submissions.website ?? null,
    investorWebsite: submissions.investorWebsite ?? null,
    headquarters: addressLine(submissions.addresses?.business),
    mailingAddress: addressLine(submissions.addresses?.mailing),
    formerNames: (submissions.formerNames ?? []).slice(0, 5).map((item) => ({ name: item.name ?? '', from: item.from ?? null, to: item.to ?? null })),
    metrics: metricCandidates.map((candidate) => latestMetric(facts, candidate)).filter((metric): metric is CompanyMetric => Boolean(metric)),
    historicalPeriods: buildHistoricalPeriods(facts),
    ratios: buildRatios(facts),
    filings,
    source: { authority: 'SEC', retrievedAt: new Date().toISOString(), submissionsUrl, factsUrl },
  };
}

export async function getComparableCompanies(tickers: readonly string[], subjectSic: string | null): Promise<ComparableCompanyProfile[]> {
  const uniqueTickers = Array.from(new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean))).slice(0, 4);
  const profiles = await Promise.all(uniqueTickers.map((ticker) => getCompanyProfile(ticker).catch(() => null)));
  return profiles.filter((profile): profile is CompanyProfile => Boolean(profile)).map((profile) => ({
    cik: profile.cik,
    ticker: profile.ticker,
    name: profile.name,
    exchange: profile.exchange,
    sic: profile.sic,
    sicDescription: profile.sicDescription,
    sameSic: Boolean(subjectSic && profile.sic && subjectSic === profile.sic),
    latestRevenue: profile.metrics.find((metric) => metric.key === 'revenue') ?? null,
    latestNetIncome: profile.metrics.find((metric) => metric.key === 'net_income') ?? null,
    latestAssets: profile.metrics.find((metric) => metric.key === 'assets') ?? null,
    revenueGrowth: profile.ratios.find((ratio) => ratio.key === 'revenue_growth_yoy') ?? null,
    netMargin: profile.ratios.find((ratio) => ratio.key === 'net_margin') ?? null,
  }));
}
