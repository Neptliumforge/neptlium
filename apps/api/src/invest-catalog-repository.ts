import { randomUUID } from 'node:crypto';
import { ApiError } from './errors.js';
import {
  assertTransition,
  jurisdictions,
  type CatalogVersionDocument,
  type DraftContent,
  type ProductFamily,
  type VersionStatus,
} from './invest-catalog-domain.js';
import { seedProducts, seedSectors } from './invest-catalog-seed.js';

type Fetch = typeof fetch;

export interface CatalogSectorRecord {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
}

export interface AdminVersionDocument extends CatalogVersionDocument {
  readonly authored_by: string;
  readonly submitted_by: string | null;
  readonly approved_by: string | null;
  readonly created_at: string;
  readonly submitted_at: string | null;
  readonly approved_at: string | null;
  readonly retired_at: string | null;
}

export interface TransitionResult {
  readonly version_id: string;
  readonly status: VersionStatus;
  readonly replayed: boolean;
}

export interface InvestCatalogRepository {
  ready(): Promise<boolean>;
  publishedCatalog(): Promise<CatalogVersionDocument[]>;
  sectors(): Promise<CatalogSectorRecord[]>;
  adminCatalog(): Promise<AdminVersionDocument[]>;
  createDraft(input: {
    slug: string;
    family: ProductFamily;
    actor: string;
    content: DraftContent;
  }): Promise<{ product_id: string; version_id: string; version: number; status: 'DRAFT' }>;
  transition(input: {
    versionId: string;
    actor: string;
    toStatus: VersionStatus;
    rationale: string | null;
  }): Promise<TransitionResult>;
}

const unavailable = () =>
  new ApiError(503, 'invest_catalog_unavailable', 'The investment catalog is unavailable');

// Database rule violations raised by invest_* commands, mapped to typed API errors.
const ruleErrors: readonly [RegExp, () => ApiError][] = [
  [/catalog version not found/, () => new ApiError(404, 'invest_product_not_found', 'Catalog version not found')],
  [/is not permitted/, () => new ApiError(409, 'invest_transition_rejected', 'This status change is not permitted', { reason: 'transition_not_permitted' })],
  [/reviewer other than the author/, () => new ApiError(409, 'invest_transition_rejected', 'Approval requires a reviewer other than the author and submitter', { reason: 'reviewer_must_differ' })],
  [/requires a rationale/, () => new ApiError(422, 'validation_failed', 'A rationale of at least 10 characters is required')],
  [/publishing investable products is disabled/, () => new ApiError(409, 'invest_transition_rejected', 'Publishing investable products is disabled', { reason: 'investable_publication_disabled' })],
  [/requires a .* disclosure/, () => new ApiError(409, 'invest_transition_rejected', 'Publication requires its mandatory disclosures', { reason: 'disclosure_required' })],
  [/family cannot change/, () => new ApiError(409, 'invest_transition_rejected', 'A product family cannot change', { reason: 'family_immutable' })],
  [/violates (check|foreign key) constraint|invalid input value|out of range/, () => new ApiError(422, 'validation_failed', 'Catalog content failed validation')],
];

export class SupabaseInvestCatalogRepository implements InvestCatalogRepository {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly request: Fetch = fetch,
  ) {}

  private async rpc<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
    let response: Response;
    try {
      response = await this.request(`${this.url}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.serviceRoleKey}`,
          apikey: this.serviceRoleKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw unavailable();
    }
    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { message?: unknown } | null;
      const message = typeof detail?.message === 'string' ? detail.message : '';
      const mapped = ruleErrors.find(([pattern]) => pattern.test(message));
      throw mapped ? mapped[1]() : unavailable();
    }
    return (await response.json()) as T;
  }

  private async documents<T>(name: string): Promise<T[]> {
    const value = await this.rpc<unknown>(name);
    if (!Array.isArray(value)) throw unavailable();
    return value as T[];
  }

  async ready() {
    try {
      await this.rpc('invest_research_sector_list');
      return true;
    } catch {
      return false;
    }
  }
  publishedCatalog() {
    return this.documents<CatalogVersionDocument>('invest_published_catalog');
  }
  sectors() {
    return this.documents<CatalogSectorRecord>('invest_research_sector_list');
  }
  adminCatalog() {
    return this.documents<AdminVersionDocument>('invest_catalog_admin');
  }
  createDraft(input: Parameters<InvestCatalogRepository['createDraft']>[0]) {
    return this.rpc<{ product_id: string; version_id: string; version: number; status: 'DRAFT' }>(
      'invest_create_draft_version',
      { p_slug: input.slug, p_family: input.family, p_actor: input.actor, p_content: input.content },
    );
  }
  transition(input: Parameters<InvestCatalogRepository['transition']>[0]) {
    return this.rpc<TransitionResult>('invest_transition_version', {
      p_version_id: input.versionId,
      p_actor: input.actor,
      p_to_status: input.toStatus,
      p_rationale: input.rationale,
    });
  }
}

type MemoryVersion = AdminVersionDocument & { status: VersionStatus };

/**
 * In-memory catalog for local development and tests. It starts in the same
 * state as a freshly migrated database: every seeded version IN_REVIEW and
 * nothing published. invest_transition_version remains authoritative.
 */
export class MemoryInvestCatalogRepository implements InvestCatalogRepository {
  readonly versions: MemoryVersion[] = [];

  constructor(options: { initialStatus?: 'IN_REVIEW' | 'PUBLISHED' } = {}) {
    const status = options.initialStatus ?? 'IN_REVIEW';
    const sectorName = new Map<string, string>(seedSectors.map((sector) => [sector.slug, sector.name]));
    const now = new Date(0).toISOString();
    for (const product of seedProducts) {
      this.versions.push({
        product_id: randomUUID(),
        slug: product.slug,
        family: product.family,
        version_id: randomUUID(),
        version: 1,
        status,
        availability: product.availability,
        name: product.name,
        tagline: product.tagline,
        summary: product.summary,
        body: product.body,
        objective: product.objective,
        risk_level: null,
        sort_rank: product.sort_rank,
        published_at: status === 'PUBLISHED' ? now : null,
        terms: product.terms ? { terms_status: 'PROPOSED', ...product.terms } : null,
        sectors: product.sectors.map((slug) => ({ slug, name: sectorName.get(slug)! })),
        instruments: [],
        eligibility: jurisdictions.map((jurisdiction) => ({
          jurisdiction,
          status: 'NOT_SUPPORTED' as const,
          investor_classes: [],
        })),
        disclosures: [...product.disclosures]
          .sort((a, b) => a.sort_rank - b.sort_rank)
          .map((disclosure) => ({
            kind: disclosure.kind,
            jurisdiction: null,
            title: disclosure.title,
            body: disclosure.body,
          })),
        return_figures: [],
        authored_by: 'system:migration',
        submitted_by: 'system:migration',
        approved_by: null,
        created_at: now,
        submitted_at: now,
        approved_at: null,
        retired_at: null,
      });
    }
  }

  async ready() {
    return true;
  }
  async publishedCatalog() {
    return structuredClone(this.versions.filter((version) => version.status === 'PUBLISHED'));
  }
  async sectors() {
    return seedSectors.map(({ slug, name, description }) => ({ slug, name, description }));
  }
  async adminCatalog() {
    return structuredClone(this.versions);
  }
  async createDraft(input: Parameters<InvestCatalogRepository['createDraft']>[0]) {
    const existing = this.versions.filter((version) => version.slug === input.slug);
    if (existing[0] && existing[0].family !== input.family)
      throw new ApiError(409, 'invest_transition_rejected', 'A product family cannot change', {
        reason: 'family_immutable',
      });
    const known = new Map<string, string>(seedSectors.map((sector) => [sector.slug, sector.name]));
    if (input.content.sectors.some((slug) => !known.has(slug)))
      throw new ApiError(422, 'validation_failed', 'Catalog content failed validation');
    const now = new Date().toISOString();
    const version: MemoryVersion = {
      product_id: existing[0]?.product_id ?? randomUUID(),
      slug: input.slug,
      family: input.family,
      version_id: randomUUID(),
      version: existing.reduce((max, item) => Math.max(max, item.version), 0) + 1,
      status: 'DRAFT',
      availability: input.content.availability,
      name: input.content.name,
      tagline: input.content.tagline,
      summary: input.content.summary,
      body: input.content.body,
      objective: input.content.objective,
      risk_level: input.content.risk_level,
      sort_rank: input.content.sort_rank,
      published_at: null,
      terms: input.content.terms ? { terms_status: 'PROPOSED', ...input.content.terms } : null,
      sectors: input.content.sectors.map((slug) => ({ slug, name: known.get(slug)! })),
      instruments: [],
      eligibility: jurisdictions.map((jurisdiction) => ({
        jurisdiction,
        status: 'NOT_SUPPORTED' as const,
        investor_classes: [],
      })),
      disclosures: input.content.disclosures.map(({ kind, jurisdiction, title, body }) => ({
        kind,
        jurisdiction,
        title,
        body,
      })),
      return_figures: [],
      authored_by: input.actor,
      submitted_by: null,
      approved_by: null,
      created_at: now,
      submitted_at: null,
      approved_at: null,
      retired_at: null,
    };
    this.versions.push(version);
    return { product_id: version.product_id, version_id: version.version_id, version: version.version, status: 'DRAFT' as const };
  }
  async transition(input: Parameters<InvestCatalogRepository['transition']>[0]) {
    const index = this.versions.findIndex((version) => version.version_id === input.versionId);
    if (index < 0) throw new ApiError(404, 'invest_product_not_found', 'Catalog version not found');
    const current = this.versions[index]!;
    if (current.status === input.toStatus)
      return { version_id: current.version_id, status: current.status, replayed: true };
    assertTransition(
      {
        status: current.status,
        availability: current.availability,
        authoredBy: current.authored_by,
        submittedBy: current.submitted_by,
        disclosures: current.disclosures.map((disclosure) => disclosure.kind),
        proposedTerms: current.terms?.terms_status === 'PROPOSED',
      },
      input.actor,
      input.toStatus,
      input.rationale,
    );
    const now = new Date().toISOString();
    if (input.toStatus === 'PUBLISHED') {
      const previous = this.versions.findIndex(
        (version) => version.product_id === current.product_id && version.status === 'PUBLISHED',
      );
      if (previous >= 0)
        this.versions[previous] = { ...this.versions[previous]!, status: 'SUPERSEDED', retired_at: now };
    }
    this.versions[index] = {
      ...current,
      status: input.toStatus,
      submitted_by: input.toStatus === 'IN_REVIEW' ? input.actor : input.toStatus === 'DRAFT' ? null : current.submitted_by,
      submitted_at: input.toStatus === 'IN_REVIEW' ? now : input.toStatus === 'DRAFT' ? null : current.submitted_at,
      approved_by: input.toStatus === 'APPROVED' ? input.actor : current.approved_by,
      approved_at: input.toStatus === 'APPROVED' ? now : current.approved_at,
      published_at: input.toStatus === 'PUBLISHED' ? now : current.published_at,
      retired_at: input.toStatus === 'WITHDRAWN' ? now : current.retired_at,
    };
    return { version_id: current.version_id, status: input.toStatus, replayed: false };
  }
}
