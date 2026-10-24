import 'server-only';

import { apiRequest } from './client';

// Neptlium Invest catalog contract (apps/api/src/invest-catalog-domain.ts).

export type InvestFamily = 'MANAGED_PLAN' | 'THEMATIC_COLLECTION';
export type InvestAvailability = 'CONCEPT' | 'RESEARCH_ONLY' | 'INVESTABLE';
export type InvestJurisdiction = 'US' | 'NG' | 'LU' | 'GB' | 'AE' | 'SG';

export interface InvestSector {
  readonly slug: string;
  readonly name: string;
}
export interface InvestTerms {
  readonly status: 'PROPOSED' | 'APPROVED';
  readonly currency: string;
  readonly minimum_minor: string | null;
  readonly maximum_minor: string | null;
  readonly fee_note: string | null;
  readonly liquidity_note: string | null;
}
export interface InvestCapability {
  readonly state: 'DISABLED';
  readonly reason: string;
}
export interface InvestCatalogItem {
  readonly slug: string;
  readonly family: InvestFamily;
  readonly availability: InvestAvailability;
  readonly name: string;
  readonly tagline: string;
  readonly summary: string;
  readonly risk_level: number | null;
  readonly sectors: readonly InvestSector[];
  readonly terms: InvestTerms | null;
  readonly version: number;
  readonly investing: InvestCapability;
}
export interface InvestCatalogListing {
  readonly contract_version: 1;
  readonly as_of: string;
  readonly total: number;
  readonly published_total: number;
  readonly items: readonly InvestCatalogItem[];
  readonly facets: {
    readonly family: Readonly<Record<string, number>>;
    readonly availability: Readonly<Record<string, number>>;
    readonly sector: Readonly<Record<string, number>>;
  };
}
export interface InvestDisclosure {
  readonly kind: string;
  readonly jurisdiction: InvestJurisdiction | null;
  readonly title: string;
  readonly body: string;
}
export interface InvestEligibility {
  readonly jurisdiction: InvestJurisdiction;
  readonly status: 'NOT_SUPPORTED' | 'UNDER_REVIEW' | 'PERMITTED';
  readonly investor_classes: readonly string[];
}
export interface InvestReturnFigure {
  readonly kind: 'HISTORICAL_PERFORMANCE' | 'CURRENT_YIELD' | 'APPROVED_TARGET';
  readonly value_bps: number;
  readonly period: string | null;
  readonly as_of: string | null;
  readonly basis: string;
  readonly source: string | null;
  readonly methodology_ref: string | null;
}
export interface InvestInstrument {
  readonly symbol: string;
  readonly name: string;
  readonly instrument_type: string;
  readonly role: 'RESEARCH_REFERENCE' | 'CONSTITUENT';
}
export interface InvestProductDetail extends InvestCatalogItem {
  readonly contract_version: 1;
  readonly body: string;
  readonly objective: string | null;
  readonly published_at: string | null;
  readonly eligibility: readonly InvestEligibility[];
  readonly disclosures: readonly InvestDisclosure[];
  readonly instruments: readonly InvestInstrument[];
  readonly return_figures: readonly InvestReturnFigure[];
}
export interface InvestSectorRecord extends InvestSector {
  readonly description: string;
}

export interface InvestCatalogQuery {
  readonly q?: string;
  readonly family?: string;
  readonly availability?: string;
  readonly sector?: string;
  readonly sort?: string;
  readonly order?: string;
}

export function getInvestCatalog(query: InvestCatalogQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const suffix = params.size ? `?${params}` : '';
  return apiRequest<InvestCatalogListing>(`/v1/invest/catalog${suffix}`);
}

export function getInvestProduct(slug: string) {
  return apiRequest<InvestProductDetail>(`/v1/invest/catalog/${encodeURIComponent(slug)}`);
}

export function getInvestSectors() {
  return apiRequest<{ sectors: readonly InvestSectorRecord[] }>('/v1/invest/sectors');
}
