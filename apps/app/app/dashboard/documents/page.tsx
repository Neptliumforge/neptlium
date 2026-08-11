import { Badge, Section, Stack } from '@neptlium/ui';
import { requireUser } from '@/lib/auth';
import { getDocuments } from '@/lib/api/client';
import { ProductStateMessage } from '@/components/product/ProductState';
import { DownloadButton } from './DownloadButton';

const CATEGORY_LABELS: Record<string, string> = {
  statement: 'Statement',
  report: 'Report',
  investment: 'Investment document',
  compliance: 'Compliance file',
};

export default async function DocumentsPage() {
  await requireUser();
  let documents;
  let loadError = false;
  try {
    documents = (await getDocuments()).data;
  } catch {
    documents = [];
    loadError = true;
  }

  return (
    <Stack>
      <header>
        <h1>Documents</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Account statements, reports, and compliance documents supplied by the Neptlium API.</p>
      </header>

      <Section title="Document repository">
        <div className="border-y border-border-hairline">
          {loadError ? (
            <ProductStateMessage state="ERROR" title="Documents unavailable">Document state could not be loaded.</ProductStateMessage>
          ) : documents.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No documents yet">Statements, reports, and compliance documents will appear here when they are issued.</ProductStateMessage>
          ) : (
            documents.map((document) => (
              <div key={document.id} className="flex flex-col gap-3 border-b border-border-hairline py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{CATEGORY_LABELS[document.category] ?? document.category}</Badge>
                    <span className="truncate text-sm font-medium text-text-primary">{document.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <DownloadButton documentId={document.id} />
              </div>
            ))
          )}
        </div>
      </Section>
    </Stack>
  );
}
