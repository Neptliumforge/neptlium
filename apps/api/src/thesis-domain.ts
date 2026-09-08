import { ApiError } from './errors.js';
import { getThesisMetricDefinition } from './thesis-metric-registry.js';

export const thesisStrategies = ['GROWTH_EQUITY', 'VENTURE', 'PRIVATE_EQUITY', 'PUBLIC_EQUITY', 'CREDIT', 'MULTI_STRATEGY', 'CUSTOM'] as const;
export type ThesisStrategy = (typeof thesisStrategies)[number];

export const thesisCriterionOperators = ['GT', 'GTE', 'LT', 'LTE', 'BETWEEN', 'EQ', 'CONTAINS', 'IS_TRUE', 'IS_FALSE'] as const;
export type ThesisCriterionOperator = (typeof thesisCriterionOperators)[number];

export const thesisCriterionImportance = ['REQUIRED', 'PREFERRED', 'INFORMATIONAL'] as const;
export type ThesisCriterionImportance = (typeof thesisCriterionImportance)[number];

export const thesisCriterionKinds = ['QUANTITATIVE', 'QUALITATIVE'] as const;
export type ThesisCriterionKind = (typeof thesisCriterionKinds)[number];

export const thesisSourceTypes = ['FILINGS', 'EARNINGS', 'COMPANY', 'MARKET_DATA', 'RESEARCH', 'NEWS', 'REGULATORY', 'INTERNAL'] as const;
export type ThesisSourceType = (typeof thesisSourceTypes)[number];

export interface ThesisInput {
  readonly name: string;
  readonly description?: string;
  readonly strategy: ThesisStrategy;
  readonly sectors: readonly string[];
  readonly geographies: readonly string[];
  readonly isDefault?: boolean;
}

export interface ThesisRecord extends ThesisInput {
  readonly id: string;
  readonly ownerId: string;
  readonly status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  readonly version: number;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ThesisCriterionInput {
  readonly metricKey: string;
  readonly kind: ThesisCriterionKind;
  readonly operator: ThesisCriterionOperator;
  readonly numericValue?: number;
  readonly numericMin?: number;
  readonly numericMax?: number;
  readonly textValue?: string;
  readonly weightBps: number;
  readonly importance: ThesisCriterionImportance;
  readonly rationale?: string;
  readonly position: number;
}

export interface ThesisCriterionRecord extends ThesisCriterionInput {
  readonly id: string;
  readonly thesisId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ThesisEvidenceInput {
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly metricKey?: string;
  readonly claim: string;
  readonly observedValue?: unknown;
  readonly sourceType: ThesisSourceType;
  readonly sourceUri?: string;
  readonly sourceDate?: string;
  readonly reportingPeriodStart?: string;
  readonly reportingPeriodEnd?: string;
  readonly confidenceBps: number;
  readonly reported: boolean;
  readonly derived: boolean;
}

export interface ThesisEvidenceRecord extends ThesisEvidenceInput {
  readonly id: string;
  readonly ownerId: string;
  readonly capturedBy: string;
  readonly capturedAt: string;
}

function assertStringList(values: readonly string[], label: string, maxItems: number) {
  if (values.length > maxItems) throw new ApiError(422, 'thesis_invalid', `${label} cannot contain more than ${maxItems} entries`);
  const normalized = values.map((value) => value.trim()).filter(Boolean);
  if (new Set(normalized.map((value) => value.toLowerCase())).size !== normalized.length)
    throw new ApiError(422, 'thesis_invalid', `${label} contains duplicate entries`);
  return normalized;
}

export function validateThesisInput(input: ThesisInput): ThesisInput {
  const name = input.name.trim();
  const description = input.description?.trim();
  if (name.length < 2 || name.length > 120) throw new ApiError(422, 'thesis_invalid', 'Thesis name must be between 2 and 120 characters');
  if (description && description.length > 1_000) throw new ApiError(422, 'thesis_invalid', 'Thesis description cannot exceed 1000 characters');
  if (!thesisStrategies.includes(input.strategy)) throw new ApiError(422, 'thesis_invalid', 'Thesis strategy is invalid');
  return {
    ...input,
    name,
    description: description || undefined,
    sectors: assertStringList(input.sectors, 'Sectors', 50),
    geographies: assertStringList(input.geographies, 'Geographies', 50),
  };
}

function assertBasisPoints(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) throw new ApiError(422, 'thesis_criterion_invalid', `${label} must be an integer from 0 to 10000 basis points`);
}

export function validateThesisCriterion(input: ThesisCriterionInput): ThesisCriterionInput {
  const metric = getThesisMetricDefinition(input.metricKey);
  if (!metric) throw new ApiError(422, 'thesis_metric_unknown', `Unknown thesis metric: ${input.metricKey}`);
  if (!thesisCriterionKinds.includes(input.kind)) throw new ApiError(422, 'thesis_criterion_invalid', 'Criterion kind is invalid');
  if (!thesisCriterionOperators.includes(input.operator)) throw new ApiError(422, 'thesis_criterion_invalid', 'Criterion operator is invalid');
  if (!thesisCriterionImportance.includes(input.importance)) throw new ApiError(422, 'thesis_criterion_invalid', 'Criterion importance is invalid');
  assertBasisPoints(input.weightBps, 'Criterion weight');
  if (!Number.isInteger(input.position) || input.position < 0 || input.position > 10_000) throw new ApiError(422, 'thesis_criterion_invalid', 'Criterion position is invalid');

  const numericOperators: readonly ThesisCriterionOperator[] = ['GT', 'GTE', 'LT', 'LTE'];
  if (numericOperators.includes(input.operator) && typeof input.numericValue !== 'number')
    throw new ApiError(422, 'thesis_criterion_invalid', `${input.operator} requires numericValue`);
  if (input.operator === 'BETWEEN') {
    if (typeof input.numericMin !== 'number' || typeof input.numericMax !== 'number' || input.numericMin > input.numericMax)
      throw new ApiError(422, 'thesis_criterion_invalid', 'BETWEEN requires numericMin less than or equal to numericMax');
  }
  if (input.operator === 'CONTAINS' && !input.textValue?.trim()) throw new ApiError(422, 'thesis_criterion_invalid', 'CONTAINS requires textValue');
  if ((input.operator === 'IS_TRUE' || input.operator === 'IS_FALSE') && metric.valueType !== 'BOOLEAN')
    throw new ApiError(422, 'thesis_criterion_invalid', `${input.operator} requires a boolean metric`);
  if (input.kind === 'QUALITATIVE' && !metric.qualitative)
    throw new ApiError(422, 'thesis_criterion_invalid', `Metric ${input.metricKey} is not registered as qualitative`);
  if (input.kind === 'QUANTITATIVE' && metric.qualitative)
    throw new ApiError(422, 'thesis_criterion_invalid', `Metric ${input.metricKey} is registered as qualitative`);

  return {
    ...input,
    textValue: input.textValue?.trim() || undefined,
    rationale: input.rationale?.trim() || undefined,
  };
}

export function validateThesisEvidence(input: ThesisEvidenceInput): ThesisEvidenceInput {
  const subjectType = input.subjectType.trim();
  const subjectKey = input.subjectKey.trim();
  const claim = input.claim.trim();
  if (!subjectType || subjectType.length > 80) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence subjectType is invalid');
  if (!subjectKey || subjectKey.length > 240) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence subjectKey is invalid');
  if (!claim || claim.length > 2_000) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence claim is invalid');
  if (input.metricKey && !getThesisMetricDefinition(input.metricKey)) throw new ApiError(422, 'thesis_metric_unknown', `Unknown thesis metric: ${input.metricKey}`);
  if (!thesisSourceTypes.includes(input.sourceType)) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence source type is invalid');
  assertBasisPoints(input.confidenceBps, 'Evidence confidence');
  if (input.reported && input.derived) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence cannot be both reported and derived');
  if (input.sourceUri && input.sourceUri.length > 2_000) throw new ApiError(422, 'thesis_evidence_invalid', 'Evidence source URI is too long');
  return {
    ...input,
    subjectType,
    subjectKey,
    claim,
    sourceUri: input.sourceUri?.trim() || undefined,
  };
}
