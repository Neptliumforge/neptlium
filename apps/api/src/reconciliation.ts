import { randomUUID } from 'node:crypto';
import { classifyMismatch, type ReconciliationClassification } from './providers.js';
export interface ReconciliationItem {
  id: string;
  resourceId: string;
  classification: ReconciliationClassification;
  status: 'open' | 'resolved';
  details: Record<string, unknown>;
}
export interface ReconciliationReport {
  id: string;
  provider: string;
  startedAt: string;
  completedAt: string;
  items: readonly ReconciliationItem[];
}
export function reconcile(
  provider: string,
  records: ReadonlyArray<{
    resourceId: string;
    provider?: Record<string, unknown>;
    internal?: Record<string, unknown>;
  }>,
): ReconciliationReport {
  const startedAt = new Date().toISOString();
  const items = records.flatMap((record) => {
    const classification = classifyMismatch(record.provider, record.internal);
    return classification
      ? [
          {
            id: randomUUID(),
            resourceId: record.resourceId,
            classification,
            status: 'open' as const,
            details: {},
          },
        ]
      : [];
  });
  return { id: randomUUID(), provider, startedAt, completedAt: new Date().toISOString(), items };
}
