import { ApiError } from './errors.js';

// Neptlium Invest catalog domain; see docs/platform/INVEST_CATALOG.md.

export const productFamilies = ['MANAGED_PLAN', 'THEMATIC_COLLECTION'] as const;
export const availabilities = ['CONCEPT', 'RESEARCH_ONLY', 'INVESTABLE'] as const;
export const versionStatuses = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'SUPERSEDED',
  'WITHDRAWN',
] as const;
export const jurisdictions = ['US', 'NG', 'LU', 'GB', 'AE', 'SG'] as const;
export const disclosureKinds = [
  'CONCEPT_STATUS',
  'RESEARCH_ONLY',
  'NOT_AN_OFFER',
  'RISK',
  'FEES',
  'PROPOSED_TERMS',
] as const;
export const returnFigureKinds = [
  'HISTORICAL_PERFORMANCE',
  'CURRENT_YIELD',
  'HYPOTHETICAL_SCENARIO',
  'APPROVED_TARGET',
] as const;
export const catalogSorts = ['featured', 'name', 'risk'] as const;

export type ProductFamily = (typeof productFamilies)[number];
export type Availability = (typeof availabilities)[number];
export type VersionStatus = (typeof versionStatuses)[number];
export type Jurisdiction = (typeof jurisdictions)[number];
export type DisclosureKind = (typeof disclosureKinds)[number];
export type ReturnFigureKind = (typeof returnFigureKinds)[number];
export type CatalogSort = (typeof catalogSorts)[number];

export interface CatalogSector {
  readonly slug: string;
  readonly name: string;
}
export interface CatalogTerms {
  readonly terms_status: 'PROPOSED' | 'APPROVED';
  readonly currency: string;
  readonly minimum_minor: string | null;
  readonly maximum_minor: string | null;
  readonly fee_note: string | null;
  readonly liquidity_note: string | null;
}
export interface CatalogDisclosure {
  readonly kind: DisclosureKind;
  readonly jurisdiction: Jurisdiction | null;
  readonly title: string;
  readonly body: string;
}
export interface CatalogEligibility {
  readonly jurisdiction: Jurisdiction;
  readonly status: 'NOT_SUPPORTED' | 'UNDER_REVIEW' | 'PERMITTED';
  readonly investor_classes: readonly string[];
}
export interface CatalogReturnFigure {
  readonly kind: ReturnFigureKind;
  readonly value_bps: number;
  readonly period: string | null;
  readonly as_of: string | null;
  readonly basis: string;
  readonly source: string | null;
  readonly methodology_ref: string | null;
  readonly approval_status: 'UNAPPROVED' | 'APPROVED';
  readonly customer_visible: boolean;
}
export interface CatalogInstrument {
  readonly symbol: string;
  readonly name: string;
  readonly instrument_type: string;
  readonly exchange_mic: string | null;
  readonly currency: string;
  readonly role: 'RESEARCH_REFERENCE' | 'CONSTITUENT';
  readonly target_weight_bps: number | null;
}

/** A catalog version as stored (the database read model). */
export interface CatalogVersionDocument {
  readonly product_id: string;
  readonly slug: string;
  readonly family: ProductFamily;
  readonly version_id: string;
  readonly version: number;
  readonly status: VersionStatus;
  readonly availability: Availability;
  readonly name: string;
  readonly tagline: string;
  readonly summary: string;
  readonly body: string;
  readonly objective: string | null;
  readonly risk_level: number | null;
  readonly sort_rank: number;
  readonly published_at: string | null;
  readonly terms: CatalogTerms | null;
  readonly sectors: readonly CatalogSector[];
  readonly instruments: readonly CatalogInstrument[];
  readonly eligibility: readonly CatalogEligibility[];
  readonly disclosures: readonly CatalogDisclosure[];
  readonly return_figures: readonly CatalogReturnFigure[];
}

/**
 * Customer capability for acting on a product. Investment execution is not
 * enabled for any product: INVESTABLE publication is disabled in the database
 * until partner, eligibility and execution controls are reviewed.
 */
export const investingCapability = {
  state: 'DISABLED',
  reason: 'investment_execution_not_enabled',
} as const;

export interface CatalogQuery {
  readonly q: string | null;
  readonly family: ProductFamily | null;
  readonly availability: Availability | null;
  readonly sector: string | null;
  readonly sort: CatalogSort;
  readonly order: 'asc' | 'desc';
}

function oneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
  field: string,
): T | null {
  if (value === null || value === '') return null;
  if (!(allowed as readonly string[]).includes(value))
    throw new ApiError(422, 'validation_failed', `${field} must be one of ${allowed.join(', ')}`);
  return value as T;
}

export function parseCatalogQuery(query: URLSearchParams): CatalogQuery {
  const q = query.get('q')?.trim() ?? '';
  if (q.length > 80)
    throw new ApiError(422, 'validation_failed', 'q must be at most 80 characters');
  const sector = query.get('sector')?.trim() ?? '';
  if (sector && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(sector))
    throw new ApiError(422, 'validation_failed', 'sector must be a sector slug');
  return {
    q: q || null,
    family: oneOf(query.get('family'), productFamilies, 'family'),
    availability: oneOf(query.get('availability'), availabilities, 'availability'),
    sector: sector || null,
    sort: oneOf(query.get('sort'), catalogSorts, 'sort') ?? 'featured',
    order: oneOf(query.get('order'), ['asc', 'desc'] as const, 'order') ?? 'asc',
  };
}

const familyLabels: Record<ProductFamily, string> = {
  MANAGED_PLAN: 'managed plan',
  THEMATIC_COLLECTION: 'research collection',
};

function searchableText(document: CatalogVersionDocument) {
  return [
    document.name,
    document.tagline,
    document.summary,
    familyLabels[document.family],
    ...document.sectors.map((sector) => sector.name),
  ]
    .join(' ')
    .toLowerCase();
}

function compareBy(sort: CatalogSort) {
  return (a: CatalogVersionDocument, b: CatalogVersionDocument) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'risk') {
      // Unrated products sort after rated ones in either direction of interest.
      const left = a.risk_level ?? Number.POSITIVE_INFINITY;
      const right = b.risk_level ?? Number.POSITIVE_INFINITY;
      if (left !== right) return left - right;
    }
    return a.sort_rank - b.sort_rank || a.name.localeCompare(b.name);
  };
}

export function selectCatalog(
  documents: readonly CatalogVersionDocument[],
  query: CatalogQuery,
): CatalogVersionDocument[] {
  const tokens = query.q ? query.q.toLowerCase().split(/\s+/).filter(Boolean) : [];
  const selected = documents.filter(
    (document) =>
      document.status === 'PUBLISHED' &&
      (!query.family || document.family === query.family) &&
      (!query.availability || document.availability === query.availability) &&
      (!query.sector || document.sectors.some((sector) => sector.slug === query.sector)) &&
      tokens.every((token) => searchableText(document).includes(token)),
  );
  selected.sort(compareBy(query.sort));
  if (query.order === 'desc') selected.reverse();
  return selected;
}

function count<T extends string>(values: readonly T[]) {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function customerTerms(terms: CatalogTerms | null) {
  return terms
    ? {
        status: terms.terms_status,
        currency: terms.currency,
        minimum_minor: terms.minimum_minor,
        maximum_minor: terms.maximum_minor,
        fee_note: terms.fee_note,
        liquidity_note: terms.liquidity_note,
      }
    : null;
}

export function catalogItem(document: CatalogVersionDocument) {
  return {
    slug: document.slug,
    family: document.family,
    availability: document.availability,
    name: document.name,
    tagline: document.tagline,
    summary: document.summary,
    risk_level: document.risk_level,
    sectors: document.sectors,
    terms: customerTerms(document.terms),
    version: document.version,
    investing: investingCapability,
  };
}

/** Customer projection: only approved, customer-visible return figures ever leave the API. */
export function catalogDetail(document: CatalogVersionDocument) {
  return {
    contract_version: 1,
    ...catalogItem(document),
    body: document.body,
    objective: document.objective,
    published_at: document.published_at,
    eligibility: document.eligibility,
    disclosures: document.disclosures,
    instruments: document.instruments,
    return_figures: document.return_figures.filter(
      (figure) =>
        figure.customer_visible &&
        figure.approval_status === 'APPROVED' &&
        figure.kind !== 'HYPOTHETICAL_SCENARIO',
    ),
  };
}

export function catalogListing(
  documents: readonly CatalogVersionDocument[],
  query: CatalogQuery,
  asOf: Date,
) {
  const published = documents.filter((document) => document.status === 'PUBLISHED');
  const items = selectCatalog(published, query);
  return {
    contract_version: 1,
    as_of: asOf.toISOString(),
    query,
    total: items.length,
    published_total: published.length,
    items: items.map(catalogItem),
    facets: {
      family: count(published.map((document) => document.family)),
      availability: count(published.map((document) => document.availability)),
      sector: count(published.flatMap((document) => document.sectors.map((sector) => sector.slug))),
    },
  };
}

// --- Administrative content ------------------------------------------------

function boundedText(value: unknown, field: string, maximum: number, required = true) {
  if (value === undefined || value === null) {
    if (required) throw new ApiError(422, 'validation_failed', `${field} is required`);
    return null;
  }
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maximum)
    throw new ApiError(
      422,
      'validation_failed',
      `${field} must be a non-empty string of at most ${maximum} characters`,
    );
  return value.trim();
}

function minorAmount(value: unknown, field: string) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !/^\d{1,15}$/.test(value))
    throw new ApiError(
      422,
      'validation_failed',
      `${field} must be a whole number of minor units as a string`,
    );
  return value;
}

export interface DraftContent {
  readonly availability: Availability;
  readonly name: string;
  readonly tagline: string;
  readonly summary: string;
  readonly body: string;
  readonly objective: string | null;
  readonly risk_level: number | null;
  readonly sort_rank: number;
  readonly sectors: readonly string[];
  readonly disclosures: readonly {
    kind: DisclosureKind;
    jurisdiction: Jurisdiction | null;
    title: string;
    body: string;
    sort_rank: number;
  }[];
  readonly terms: {
    currency: string;
    minimum_minor: string | null;
    maximum_minor: string | null;
    fee_note: string | null;
    liquidity_note: string | null;
  } | null;
}

export function parseDraftRequest(slug: string, body: unknown) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 64)
    throw new ApiError(422, 'validation_failed', 'slug must be lowercase words joined by hyphens');
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
  const input = body as Record<string, unknown>;
  const family = oneOf(
    typeof input.family === 'string' ? input.family : null,
    productFamilies,
    'family',
  );
  if (!family) throw new ApiError(422, 'validation_failed', 'family is required');
  const content = input.content;
  if (!content || typeof content !== 'object' || Array.isArray(content))
    throw new ApiError(422, 'validation_failed', 'content must be an object');
  const c = content as Record<string, unknown>;
  const availability = oneOf(
    typeof c.availability === 'string' ? c.availability : null,
    availabilities,
    'availability',
  );
  if (!availability) throw new ApiError(422, 'validation_failed', 'availability is required');
  if (
    c.risk_level !== undefined &&
    c.risk_level !== null &&
    !(Number.isInteger(c.risk_level) && (c.risk_level as number) >= 1 && (c.risk_level as number) <= 7)
  )
    throw new ApiError(422, 'validation_failed', 'risk_level must be an integer from 1 to 7');
  const sectors = Array.isArray(c.sectors) ? c.sectors : [];
  if (
    sectors.length > 12 ||
    !sectors.every((sector) => typeof sector === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(sector))
  )
    throw new ApiError(422, 'validation_failed', 'sectors must be up to 12 sector slugs');
  const disclosures = Array.isArray(c.disclosures) ? c.disclosures : [];
  if (disclosures.length > 20)
    throw new ApiError(422, 'validation_failed', 'At most 20 disclosures are allowed');
  const terms = c.terms;
  const draft: DraftContent = {
    availability,
    name: boundedText(c.name, 'name', 80)!,
    tagline: boundedText(c.tagline, 'tagline', 160)!,
    summary: boundedText(c.summary, 'summary', 600)!,
    body: boundedText(c.body, 'body', 8000)!,
    objective: boundedText(c.objective, 'objective', 300, false),
    risk_level: (c.risk_level as number | undefined) ?? null,
    sort_rank: Number.isInteger(c.sort_rank) ? (c.sort_rank as number) : 100,
    sectors: sectors as string[],
    disclosures: disclosures.map((entry, index) => {
      if (!entry || typeof entry !== 'object')
        throw new ApiError(422, 'validation_failed', `disclosures[${index}] must be an object`);
      const d = entry as Record<string, unknown>;
      const kind = oneOf(
        typeof d.kind === 'string' ? d.kind : null,
        disclosureKinds,
        `disclosures[${index}].kind`,
      );
      if (!kind)
        throw new ApiError(422, 'validation_failed', `disclosures[${index}].kind is required`);
      return {
        kind,
        jurisdiction: oneOf(
          typeof d.jurisdiction === 'string' ? d.jurisdiction : null,
          jurisdictions,
          `disclosures[${index}].jurisdiction`,
        ),
        title: boundedText(d.title, `disclosures[${index}].title`, 120)!,
        body: boundedText(d.body, `disclosures[${index}].body`, 2000)!,
        sort_rank: Number.isInteger(d.sort_rank) ? (d.sort_rank as number) : 100,
      };
    }),
    terms:
      terms && typeof terms === 'object' && !Array.isArray(terms)
        ? (() => {
            const t = terms as Record<string, unknown>;
            if (typeof t.currency !== 'string' || !/^[A-Z]{3}$/.test(t.currency))
              throw new ApiError(422, 'validation_failed', 'terms.currency must be an ISO 4217 code');
            const minimum = minorAmount(t.minimum_minor, 'terms.minimum_minor');
            const maximum = minorAmount(t.maximum_minor, 'terms.maximum_minor');
            if (minimum !== null && maximum !== null && BigInt(minimum) > BigInt(maximum))
              throw new ApiError(422, 'validation_failed', 'terms.minimum_minor exceeds terms.maximum_minor');
            return {
              currency: t.currency,
              minimum_minor: minimum,
              maximum_minor: maximum,
              fee_note: boundedText(t.fee_note, 'terms.fee_note', 600, false),
              liquidity_note: boundedText(t.liquidity_note, 'terms.liquidity_note', 600, false),
            };
          })()
        : null,
  };
  return { slug, family, content: draft };
}

export function parseTransitionRequest(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ApiError(422, 'validation_failed', 'Request body must be an object');
  const input = body as Record<string, unknown>;
  const toStatus = oneOf(
    typeof input.to_status === 'string' ? input.to_status : null,
    versionStatuses,
    'to_status',
  );
  if (!toStatus || toStatus === 'SUPERSEDED')
    throw new ApiError(
      422,
      'validation_failed',
      'to_status must be DRAFT, IN_REVIEW, APPROVED, PUBLISHED or WITHDRAWN',
    );
  const rationale =
    input.rationale === undefined || input.rationale === null
      ? null
      : boundedText(input.rationale, 'rationale', 1000);
  return { toStatus, rationale };
}

/**
 * Mirrors invest_transition_version for the in-memory repository. The database
 * function is authoritative; this keeps local and test behaviour faithful.
 */
export function assertTransition(
  current: { status: VersionStatus; availability: Availability; authoredBy: string; submittedBy: string | null; disclosures: readonly DisclosureKind[]; proposedTerms: boolean },
  actor: string,
  toStatus: VersionStatus,
  rationale: string | null,
): void {
  const allowed: Record<VersionStatus, readonly VersionStatus[]> = {
    DRAFT: ['IN_REVIEW', 'WITHDRAWN'],
    IN_REVIEW: ['DRAFT', 'APPROVED', 'WITHDRAWN'],
    APPROVED: ['PUBLISHED', 'WITHDRAWN'],
    PUBLISHED: ['WITHDRAWN'],
    SUPERSEDED: [],
    WITHDRAWN: [],
  };
  const reject = (reason: string, message: string) => {
    throw new ApiError(409, 'invest_transition_rejected', message, { reason });
  };
  if (!allowed[current.status].includes(toStatus))
    reject('transition_not_permitted', `catalog transition ${current.status} -> ${toStatus} is not permitted`);
  if (
    ['DRAFT', 'APPROVED', 'PUBLISHED', 'WITHDRAWN'].includes(toStatus) &&
    (!rationale || rationale.trim().length < 10)
  )
    throw new ApiError(422, 'validation_failed', 'A rationale of at least 10 characters is required');
  if (toStatus === 'APPROVED' && (actor === current.authoredBy || actor === current.submittedBy))
    reject('reviewer_must_differ', 'catalog approval requires a reviewer other than the author and submitter');
  if (toStatus === 'PUBLISHED') {
    if (current.availability === 'INVESTABLE')
      reject('investable_publication_disabled', 'publishing investable products is disabled');
    if (current.availability === 'CONCEPT' && !current.disclosures.includes('CONCEPT_STATUS'))
      reject('disclosure_required', 'concept publication requires a concept status disclosure');
    if (current.availability === 'RESEARCH_ONLY' && !current.disclosures.includes('RESEARCH_ONLY'))
      reject('disclosure_required', 'research publication requires a research-only disclosure');
    if (!current.disclosures.includes('NOT_AN_OFFER'))
      reject('disclosure_required', 'publication requires a not-an-offer disclosure');
    if (current.proposedTerms && !current.disclosures.includes('PROPOSED_TERMS'))
      reject('disclosure_required', 'publishing proposed terms requires a proposed terms disclosure');
  }
}
