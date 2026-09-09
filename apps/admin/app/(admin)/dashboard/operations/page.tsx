import { requireAdminUser } from '@/lib/auth';
import { adminApiRequest } from '@/lib/api/client';
import { PageHeader } from '@/components/layout/PageHeader';

interface OperationalPayload {
  readonly [key: string]: unknown;
}

function rows(payload: unknown): OperationalPayload[] {
  if (Array.isArray(payload)) return payload.filter((item): item is OperationalPayload => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: unknown[] }).data.filter((item): item is OperationalPayload => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  }
  return [];
}

function value(item: OperationalPayload, keys: string[]): string {
  const found = keys.map((key) => item[key]).find((candidate) => candidate !== undefined && candidate !== null && candidate !== '');
  if (found === undefined) return '—';
  return typeof found === 'object' ? JSON.stringify(found) : String(found);
}

async function read(path: `/v1/admin${string}`): Promise<unknown> {
  try {
    return await adminApiRequest<unknown>(path);
  } catch {
    return null;
  }
}

function Surface({ title, description, data, fields }: { readonly title: string; readonly description: string; readonly data: unknown; readonly fields: ReadonlyArray<readonly [string, string[]]> }) {
  const items = rows(data);
  return (
    <section className="rounded-lg border border-border-default bg-surface-card">
      <div className="border-b border-border-hairline px-5 py-4">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-sm text-text-muted">No operational records returned.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-border-hairline text-text-muted">
              <tr>{fields.map(([label]) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {items.slice(0, 50).map((item, index) => (
                <tr key={value(item, ['id', 'run_id', 'event_id', 'provider_event_id']) !== '—' ? value(item, ['id', 'run_id', 'event_id', 'provider_event_id']) : `${title}-${index}`}>
                  {fields.map(([label, keys]) => <td key={label} className="px-5 py-3 align-top text-text-secondary">{value(item, keys)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function OperationsPage() {
  await requireAdminUser();
  const [fundings, withdrawals, reconciliationRuns, reconciliationItems, providerEvents] = await Promise.all([
    read('/v1/admin/fundings'),
    read('/v1/admin/withdrawals/canonical'),
    read('/v1/admin/reconciliation/runs'),
    read('/v1/admin/reconciliation/items'),
    read('/v1/admin/webhooks/provider'),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Operational visibility" description="Read-only operational truth from the canonical administrative API." />
      <div className="space-y-6">
        <Surface title="Funding Operations" description="Canonical funding lifecycle and source information." data={fundings} fields={[
          ['State', ['state', 'status', 'lifecycle_state']], ['Asset', ['asset']], ['Source', ['source', 'rail']], ['Created', ['created_at', 'createdAt']], ['Updated', ['updated_at', 'updatedAt']],
        ]} />
        <Surface title="Withdrawal Operations" description="Canonical withdrawal lifecycle and reconciliation context. No execution controls are exposed." data={withdrawals} fields={[
          ['State', ['state', 'status', 'lifecycle_state']], ['Asset', ['asset']], ['Reconciliation', ['reconciliation_state', 'reconciliation_status']], ['Created', ['created_at', 'createdAt']], ['Updated', ['updated_at', 'updatedAt']],
        ]} />
        <Surface title="Reconciliation Runs" description="Observed reconciliation status and lifecycle context." data={reconciliationRuns} fields={[
          ['State', ['state', 'status']], ['Run', ['id', 'run_id']], ['Started', ['started_at', 'startedAt']], ['Completed', ['completed_at', 'completedAt']], ['Source', ['source']],
        ]} />
        <Surface title="Reconciliation Items" description="Observed mismatches and reconciliation evidence context." data={reconciliationItems} fields={[
          ['Status', ['status', 'state']], ['Entity', ['resource_id', 'resourceId', 'entity_id']], ['Classification', ['classification', 'classification_code']], ['Observed', ['observed_at', 'created_at']], ['Source', ['source']],
        ]} />
        <Surface title="Provider Events" description="Received provider events and their processing state." data={providerEvents} fields={[
          ['Provider', ['provider']], ['Event', ['event_id', 'provider_event_id', 'id']], ['State', ['state', 'processing_state']], ['Received', ['received_at', 'created_at']], ['Processed', ['processed_at', 'updated_at']],
        ]} />
      </div>
    </div>
  );
}
