import { Badge, Section, Stack } from '@neptlium/ui';
import { requireRole } from '@/lib/auth';
import { getDocuments } from '@/lib/api/client';
import { ProductStateMessage } from '@/components/product/ProductState';
import { DownloadButton } from '../documents/DownloadButton';

export default async function ReportsPage() {
  await requireRole("analyst");
  let reports = [] as Awaited<ReturnType<typeof getDocuments>>['data'];
  let loadError = false;
  try {
    reports = (await getDocuments()).data.filter((document) => document.category === 'report');
  } catch {
    loadError = true;
  }

  return (
    <Stack>
      <header><h1>Reports</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Governed reports published to this account.</p></header>
      <Section title="Reports">
        <div className="border-y border-border-hairline">
          {loadError ? (
            <ProductStateMessage state="ERROR" title="Reports could not be loaded">The Neptlium API did not return the current report state.</ProductStateMessage>
          ) : reports.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No published reports">The current API response contains no reports for this account.</ProductStateMessage>
          ) : reports.map((report) => (
            <div key={report.id} className="flex flex-col gap-3 border-b border-border-hairline py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0"><Badge tone="neutral">Report</Badge><p className="mt-2 truncate text-sm font-medium text-text-primary">{report.title}</p><p className="mt-1 text-xs text-text-muted">{new Date(report.createdAt).toLocaleDateString()}</p></div>
              <DownloadButton documentId={report.id} />
            </div>
          ))}
        </div>
      </Section>
    </Stack>
  );
}
