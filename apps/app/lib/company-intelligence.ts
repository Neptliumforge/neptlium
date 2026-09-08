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

export type CompanyFiling = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string | null;
  form: string;
  primaryDocument: string;
  url: string;
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
    };
  };
};

type FactUnit = { val?: number; end?: string; filed?: string; form?: string; fp?: string; fy?: number; accn?: string };
type SecFacts = { facts?: { 'us-gaap'?: Record<string, { units?: Record<string, FactUnit[]> }> } };

const metricCandidates = [
  { key: 'revenue', label: 'Revenue', tags: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'] },
  { key: 'net_income', label: 'Net income', tags: ['NetIncomeLoss'] },
  { key: 'assets', label: 'Total assets', tags: ['Assets'] },
  { key: 'liabilities', label: 'Total liabilities', tags: ['Liabilities'] },
  { key: 'cash', label: 'Cash & equivalents', tags: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'] },
  { key: 'equity', label: 'Stockholders’ equity', tags: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'] },
] as const;

function latestMetric(facts: SecFacts, candidate: (typeof metricCandidates)[number]): CompanyMetric | null {
  const gaap = facts.facts?.['us-gaap'] ?? {};
  for (const tag of candidate.tags) {
    const units = gaap[tag]?.units;
    if (!units) continue;
    const preferredUnit = units.USD ? 'USD' : Object.keys(units)[0];
    if (!preferredUnit) continue;
    const rows = (units[preferredUnit] ?? [])
      .filter((row) => typeof row.val === 'number' && row.end && row.filed && ['10-K', '10-Q', '20-F', '40-F'].includes(row.form ?? ''))
      .sort((a, b) => String(b.filed).localeCompare(String(a.filed)) || String(b.end).localeCompare(String(a.end)));
    const row = rows[0];
    if (row?.val === undefined || !row.end || !row.filed || !row.form) continue;
    return { key: candidate.key, label: candidate.label, value: row.val, unit: preferredUnit, periodEnd: row.end, filed: row.filed, form: row.form, sourceTag: tag };
  }
  return null;
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
  for (let index = 0; index < accessionNumbers.length && filings.length < 12; index += 1) {
    const form = recent?.form?.[index] ?? '';
    if (!['10-K', '10-Q', '8-K', '20-F', '6-K', '40-F'].includes(form)) continue;
    const accessionNumber = accessionNumbers[index] ?? '';
    const primaryDocument = recent?.primaryDocument?.[index] ?? '';
    if (!accessionNumber || !primaryDocument) continue;
    const accessionCompact = accessionNumber.replace(/-/g, '');
    filings.push({
      accessionNumber,
      filingDate: recent?.filingDate?.[index] ?? '',
      reportDate: recent?.reportDate?.[index] || null,
      form,
      primaryDocument,
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
    filings,
    source: { authority: 'SEC', retrievedAt: new Date().toISOString(), submissionsUrl, factsUrl },
  };
}
