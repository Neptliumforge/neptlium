export type ThesisMetricValueType = 'PERCENTAGE' | 'CURRENCY' | 'MULTIPLE' | 'NUMBER' | 'BOOLEAN' | 'TEXT';
export type ThesisMetricCategory = 'GROWTH' | 'ECONOMICS' | 'QUALITY' | 'VALUATION' | 'OWNERSHIP' | 'RISK' | 'MARKET';

export interface ThesisMetricDefinition {
  readonly key: string;
  readonly label: string;
  readonly category: ThesisMetricCategory;
  readonly valueType: ThesisMetricValueType;
  readonly unit: string | null;
  readonly description: string;
  readonly sourcePreference: readonly string[];
  readonly qualitative: boolean;
}

export const thesisMetricRegistry = Object.freeze([
  {
    key: 'revenue',
    label: 'Revenue',
    category: 'GROWTH',
    valueType: 'CURRENCY',
    unit: null,
    description: 'Reported revenue for the selected reporting period.',
    sourcePreference: ['FILINGS', 'EARNINGS', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'revenue_growth_yoy',
    label: 'Revenue growth',
    category: 'GROWTH',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Year-over-year revenue growth for comparable periods.',
    sourcePreference: ['FILINGS', 'EARNINGS', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'arr_growth_yoy',
    label: 'ARR growth',
    category: 'GROWTH',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Year-over-year annual recurring revenue growth where ARR is explicitly reported or derivable from authoritative evidence.',
    sourcePreference: ['EARNINGS', 'FILINGS', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'gross_margin',
    label: 'Gross margin',
    category: 'ECONOMICS',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Gross profit divided by revenue for the selected period.',
    sourcePreference: ['FILINGS', 'EARNINGS'],
    qualitative: false,
  },
  {
    key: 'ebitda_margin',
    label: 'EBITDA margin',
    category: 'ECONOMICS',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'EBITDA divided by revenue. Reported and adjusted forms must remain distinguishable in evidence.',
    sourcePreference: ['FILINGS', 'EARNINGS'],
    qualitative: false,
  },
  {
    key: 'operating_margin',
    label: 'Operating margin',
    category: 'ECONOMICS',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Operating income divided by revenue for the selected period.',
    sourcePreference: ['FILINGS', 'EARNINGS'],
    qualitative: false,
  },
  {
    key: 'free_cash_flow_margin',
    label: 'Free cash flow margin',
    category: 'ECONOMICS',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Free cash flow divided by revenue using the evidence-backed free-cash-flow definition.',
    sourcePreference: ['FILINGS', 'EARNINGS'],
    qualitative: false,
  },
  {
    key: 'net_revenue_retention',
    label: 'Net revenue retention',
    category: 'QUALITY',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Net revenue retention or equivalent reported retention metric.',
    sourcePreference: ['EARNINGS', 'FILINGS', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'customer_concentration',
    label: 'Customer concentration',
    category: 'RISK',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Revenue exposure to the largest customer or governed concentration cohort.',
    sourcePreference: ['FILINGS', 'EARNINGS'],
    qualitative: false,
  },
  {
    key: 'ev_revenue_forward',
    label: 'Forward EV / Revenue',
    category: 'VALUATION',
    valueType: 'MULTIPLE',
    unit: 'x',
    description: 'Enterprise value divided by forward revenue estimate with valuation timestamp preserved.',
    sourcePreference: ['MARKET_DATA', 'FILINGS', 'RESEARCH'],
    qualitative: false,
  },
  {
    key: 'ev_ebitda_forward',
    label: 'Forward EV / EBITDA',
    category: 'VALUATION',
    valueType: 'MULTIPLE',
    unit: 'x',
    description: 'Enterprise value divided by forward EBITDA estimate with estimate provenance preserved.',
    sourcePreference: ['MARKET_DATA', 'FILINGS', 'RESEARCH'],
    qualitative: false,
  },
  {
    key: 'pe_forward',
    label: 'Forward P / E',
    category: 'VALUATION',
    valueType: 'MULTIPLE',
    unit: 'x',
    description: 'Price-to-earnings multiple based on forward earnings estimates.',
    sourcePreference: ['MARKET_DATA', 'RESEARCH'],
    qualitative: false,
  },
  {
    key: 'founder_ownership',
    label: 'Founder ownership',
    category: 'OWNERSHIP',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Founder beneficial ownership based on the latest authoritative ownership disclosure.',
    sourcePreference: ['FILINGS', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'institutional_ownership',
    label: 'Institutional ownership',
    category: 'OWNERSHIP',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Institutional beneficial ownership using a dated ownership dataset.',
    sourcePreference: ['FILINGS', 'MARKET_DATA'],
    qualitative: false,
  },
  {
    key: 'market_growth',
    label: 'Market growth',
    category: 'MARKET',
    valueType: 'PERCENTAGE',
    unit: 'percent',
    description: 'Evidence-backed growth rate for the governed target market definition.',
    sourcePreference: ['RESEARCH', 'COMPANY'],
    qualitative: false,
  },
  {
    key: 'founder_led',
    label: 'Founder-led',
    category: 'QUALITY',
    valueType: 'BOOLEAN',
    unit: null,
    description: 'Whether a founder currently holds an executive leadership role, supported by dated evidence.',
    sourcePreference: ['FILINGS', 'COMPANY'],
    qualitative: true,
  },
  {
    key: 'category_leadership',
    label: 'Category leadership',
    category: 'MARKET',
    valueType: 'TEXT',
    unit: null,
    description: 'Evidence-based assessment of category position. Phase 1 defines the metric only; scoring is deferred.',
    sourcePreference: ['RESEARCH', 'FILINGS', 'COMPANY'],
    qualitative: true,
  },
  {
    key: 'switching_costs',
    label: 'Switching costs',
    category: 'QUALITY',
    valueType: 'TEXT',
    unit: null,
    description: 'Evidence-based assessment of customer switching costs. Phase 1 defines the metric only; scoring is deferred.',
    sourcePreference: ['FILINGS', 'EARNINGS', 'RESEARCH'],
    qualitative: true,
  },
  {
    key: 'regulatory_exposure',
    label: 'Regulatory exposure',
    category: 'RISK',
    valueType: 'TEXT',
    unit: null,
    description: 'Evidence-backed regulatory exposure assessment. Phase 1 defines the metric only; scoring is deferred.',
    sourcePreference: ['FILINGS', 'REGULATORY', 'NEWS'],
    qualitative: true,
  },
] satisfies readonly ThesisMetricDefinition[]);

export type ThesisMetricKey = (typeof thesisMetricRegistry)[number]['key'];

const registryByKey = new Map<string, ThesisMetricDefinition>(thesisMetricRegistry.map((metric) => [metric.key, metric]));

export function getThesisMetricDefinition(key: string): ThesisMetricDefinition | null {
  return registryByKey.get(key) ?? null;
}

export function assertThesisMetricRegistryIntegrity(): void {
  const keys = new Set<string>();
  for (const metric of thesisMetricRegistry) {
    if (!/^[a-z][a-z0-9_]*$/.test(metric.key)) throw new Error(`Invalid thesis metric key: ${metric.key}`);
    if (keys.has(metric.key)) throw new Error(`Duplicate thesis metric key: ${metric.key}`);
    keys.add(metric.key);
    if (!metric.label.trim() || !metric.description.trim()) throw new Error(`Incomplete thesis metric definition: ${metric.key}`);
    if (metric.sourcePreference.length === 0) throw new Error(`Thesis metric requires source preference: ${metric.key}`);
  }
}
