import { ApiError } from './errors.js';
import type { ProviderState } from './providers.js';

/**
 * Identity verification is a Neptlium-owned account domain. It is separate from
 * authentication (Supabase Auth proves identity of the session only), from account
 * onboarding (profile setup) and from account standing (`profiles.compliance_status`,
 * which records operator suspend/activate decisions and defaults to `pending` for
 * every account). None of those values may be read as a verification outcome.
 *
 * Status is derived only from Neptlium verification records. A provider session
 * start is not a submission, and provider evidence must be verified and normalized
 * into a record before any status changes.
 */
export const identityVerificationStatuses = [
  'NOT_VERIFIED',
  'PENDING',
  'ACTION_REQUIRED',
  'VERIFIED',
] as const;
export type IdentityVerificationStatus = (typeof identityVerificationStatuses)[number];

export interface IdentityVerificationRecord {
  status: IdentityVerificationStatus;
  updatedAt: string;
  /** Customer-safe reason normalized inside the domain; never a raw provider error. */
  actionRequiredReason: string | null;
}

export interface IdentityVerificationRecordStore {
  /** False until a durable, reviewed verification record store exists. */
  readonly configured: boolean;
  latest(principalId: string): Promise<IdentityVerificationRecord | null>;
}

export interface IdentityVerificationSession {
  /** Provider-hosted continuation for the customer. */
  customerActionUrl: string;
  expiresAt: string;
}

/**
 * Domain-specific provider contract. A future adapter implements this boundary and
 * normalizes provider evidence into `IdentityVerificationRecord`s; signup, onboarding
 * and the App do not change when an adapter is added or replaced.
 */
export interface IdentityVerificationProvider {
  readonly identity: string;
  readiness(): ProviderState;
  startSession(input: {
    principalId: string;
    idempotencyKey: string;
  }): Promise<IdentityVerificationSession>;
}

export class DisabledIdentityVerificationProvider implements IdentityVerificationProvider {
  readonly identity = 'disabled';
  readiness(): ProviderState {
    return 'not_configured';
  }
  async startSession(): Promise<never> {
    throw new ApiError(
      503,
      'identity_verification_not_enabled',
      'Identity verification is not yet enabled',
    );
  }
}

export class UnconfiguredIdentityVerificationRecords implements IdentityVerificationRecordStore {
  readonly configured = false;
  async latest(): Promise<null> {
    return null;
  }
}

export type IdentityVerificationCapability = 'NOT_ENABLED' | 'AVAILABLE' | 'DEGRADED';

export type IdentityVerificationRecordState =
  | { state: 'NOT_CONFIGURED' }
  | { state: 'UNAVAILABLE' }
  | { state: 'EMPTY' }
  | {
      state: 'VALUE';
      value: {
        status: IdentityVerificationStatus;
        updated_at: string;
        action_required_reason: string | null;
      };
    };

export interface IdentityVerificationView {
  capability: IdentityVerificationCapability;
  record: IdentityVerificationRecordState;
  can_start: boolean;
}

export interface IdentityVerificationDependencies {
  provider: IdentityVerificationProvider;
  records: IdentityVerificationRecordStore;
}

function capabilityOf({ provider, records }: IdentityVerificationDependencies) {
  const readiness = provider.readiness();
  // A provider without a durable record store cannot be offered: results would have
  // nowhere authoritative to land.
  if (readiness === 'configured' && records.configured) return 'AVAILABLE';
  if (readiness === 'degraded' && records.configured) return 'DEGRADED';
  return 'NOT_ENABLED';
}

async function recordOf(
  records: IdentityVerificationRecordStore,
  principalId: string,
): Promise<IdentityVerificationRecordState> {
  if (!records.configured) return { state: 'NOT_CONFIGURED' };
  let record: IdentityVerificationRecord | null;
  try {
    record = await records.latest(principalId);
  } catch {
    return { state: 'UNAVAILABLE' };
  }
  if (!record) return { state: 'EMPTY' };
  if (!identityVerificationStatuses.includes(record.status)) return { state: 'UNAVAILABLE' };
  return {
    state: 'VALUE',
    value: {
      status: record.status,
      updated_at: record.updatedAt,
      action_required_reason: record.actionRequiredReason,
    },
  };
}

export async function identityVerificationView(
  dependencies: IdentityVerificationDependencies,
  principalId: string,
): Promise<IdentityVerificationView> {
  const capability = capabilityOf(dependencies);
  const record = await recordOf(dependencies.records, principalId);
  const startable =
    record.state === 'EMPTY' ||
    (record.state === 'VALUE' &&
      (record.value.status === 'NOT_VERIFIED' || record.value.status === 'ACTION_REQUIRED'));
  return { capability, record, can_start: capability === 'AVAILABLE' && startable };
}

export async function startIdentityVerification(
  dependencies: IdentityVerificationDependencies,
  principalId: string,
  idempotencyKey: string,
): Promise<IdentityVerificationSession> {
  const view = await identityVerificationView(dependencies, principalId);
  if (view.capability !== 'AVAILABLE')
    throw new ApiError(
      503,
      'identity_verification_not_enabled',
      'Identity verification is not yet enabled',
    );
  if (!view.can_start)
    throw new ApiError(
      409,
      'identity_verification_not_startable',
      'Identity verification cannot be started from the current state',
    );
  return dependencies.provider.startSession({ principalId, idempotencyKey });
}

/** Legal name changes are locked once verification is in progress or complete. */
export function legalNameLocked(record: IdentityVerificationRecordState): boolean | 'UNKNOWN' {
  if (record.state === 'NOT_CONFIGURED' || record.state === 'EMPTY') return false;
  if (record.state === 'UNAVAILABLE') return 'UNKNOWN';
  return record.value.status === 'PENDING' || record.value.status === 'VERIFIED';
}
