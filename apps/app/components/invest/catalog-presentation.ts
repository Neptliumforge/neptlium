import type {
  InvestAvailability,
  InvestCatalogItem,
  InvestEligibility,
  InvestFamily,
  InvestJurisdiction,
  InvestReturnFigure,
  InvestTerms,
} from '@/lib/api/invest';

// Customer wording for catalog states. Availability is always explicit: a
// concept or research collection is never presented as something to buy.

export const availabilityPresentation: Record<
  InvestAvailability,
  { readonly label: string; readonly detail: string; readonly tone: 'concept' | 'research' | 'available' }
> = {
  CONCEPT: { label: 'Concept', detail: 'Not available to invest', tone: 'concept' },
  RESEARCH_ONLY: { label: 'Research only', detail: 'Not an investment product', tone: 'research' },
  INVESTABLE: { label: 'Available', detail: 'Open to eligible investors', tone: 'available' },
};

export const familyPresentation: Record<InvestFamily, { readonly label: string; readonly plural: string; readonly description: string }> = {
  MANAGED_PLAN: {
    label: 'Managed plan',
    plural: 'Managed plans',
    description: 'Plan concepts under development. None can be invested in yet.',
  },
  THEMATIC_COLLECTION: {
    label: 'Research collection',
    plural: 'Research collections',
    description: 'Research context on long-term themes. Collections are not investment products.',
  },
};

export const jurisdictionNames: Record<InvestJurisdiction, string> = {
  US: 'United States',
  NG: 'Nigeria',
  LU: 'Luxembourg',
  GB: 'United Kingdom',
  AE: 'United Arab Emirates',
  SG: 'Singapore',
};

export const eligibilityLabels: Record<InvestEligibility['status'], string> = {
  NOT_SUPPORTED: 'Not yet supported',
  UNDER_REVIEW: 'Under review',
  PERMITTED: 'Permitted',
};

export const returnFigureLabels: Record<InvestReturnFigure['kind'], string> = {
  HISTORICAL_PERFORMANCE: 'Historical performance',
  CURRENT_YIELD: 'Current yield',
  APPROVED_TARGET: 'Approved target',
};

const minorExponent: Readonly<Record<string, number>> = { USD: 2, GBP: 2, EUR: 2, SGD: 2, AED: 2, NGN: 2 };
const currencySymbol: Readonly<Record<string, string>> = { USD: '$', GBP: '£', EUR: '€' };

/** Formats a whole number of minor units exactly; returns null when it cannot. */
export function formatMinorAmount(minor: string | null, currency: string): string | null {
  const exponent = minorExponent[currency];
  if (minor === null || exponent === undefined || !/^\d+$/.test(minor)) return null;
  const padded = minor.padStart(exponent + 1, '0');
  const whole = padded.slice(0, padded.length - exponent).replace(/^0+(?=\d)/, '');
  const fraction = padded.slice(padded.length - exponent);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const amount = /^0+$/.test(fraction) ? grouped : `${grouped}.${fraction}`;
  const symbol = currencySymbol[currency];
  return symbol ? `${symbol}${amount}` : `${currency} ${amount}`;
}

export function termsRows(terms: InvestTerms) {
  const qualifier = terms.status === 'PROPOSED' ? 'Proposed' : 'Approved';
  return [
    { label: `${qualifier} minimum`, value: formatMinorAmount(terms.minimum_minor, terms.currency) ?? 'Not set' },
    { label: `${qualifier} maximum`, value: formatMinorAmount(terms.maximum_minor, terms.currency) ?? 'Not set' },
  ];
}

export function termsSummary(terms: InvestTerms | null): string | null {
  if (!terms) return null;
  return termsRows(terms)
    .filter((row) => row.value !== 'Not set')
    .map((row) => `${row.label} ${row.value}`)
    .join(' · ') || null;
}

/** Basis points as a signed percentage with two decimals, e.g. 512 → "5.12%". */
export function formatBasisPoints(bps: number): string {
  const sign = bps < 0 ? '−' : '';
  const absolute = Math.abs(bps);
  return `${sign}${Math.trunc(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}%`;
}

export function groupByFamily(items: readonly InvestCatalogItem[]) {
  const order: InvestFamily[] = ['MANAGED_PLAN', 'THEMATIC_COLLECTION'];
  return order
    .map((family) => ({ family, items: items.filter((item) => item.family === family) }))
    .filter((group) => group.items.length > 0);
}

export const catalogFilterOptions = {
  family: [
    { value: '', label: 'All products' },
    { value: 'MANAGED_PLAN', label: 'Managed plans' },
    { value: 'THEMATIC_COLLECTION', label: 'Research collections' },
  ],
  availability: [
    { value: '', label: 'Any availability' },
    { value: 'CONCEPT', label: 'Concept' },
    { value: 'RESEARCH_ONLY', label: 'Research only' },
    { value: 'INVESTABLE', label: 'Available to invest' },
  ],
  sort: [
    { value: 'featured', label: 'Featured' },
    { value: 'name', label: 'Name' },
    { value: 'risk', label: 'Risk level' },
  ],
} as const;
