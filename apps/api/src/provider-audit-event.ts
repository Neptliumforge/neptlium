import type { PrimaryProvider } from './provider-doctrine.js';

export type ProviderAuditAction = 'configuration_validated' | 'connectivity_verified' | 'capability_certified' | 'execution_authorized' | 'operation_submitted' | 'evidence_received' | 'settlement_determined' | 'reconciled' | 'capability_disabled';

export interface ProviderAuditEvent {
  readonly eventId: string;
  readonly provider: PrimaryProvider;
  readonly action: ProviderAuditAction;
  readonly occurredAt: string;
  readonly actorOrSystemId: string;
  readonly correlationId?: string;
  readonly intentId?: string;
  readonly providerReference?: string;
}

export function validateProviderAuditEvent(event: ProviderAuditEvent): void {
  if (!event.eventId.trim() || !event.actorOrSystemId.trim()) throw new Error('provider audit event requires stable identity');
  if (!Number.isFinite(Date.parse(event.occurredAt))) throw new Error('provider audit event requires a valid timestamp');
}
