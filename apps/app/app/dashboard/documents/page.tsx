import { FileText } from "lucide-react";
import { Badge, Card, CardContent, EmptyState } from "@neptlium/ui";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { DownloadButton } from "./DownloadButton";

const CATEGORY_LABELS: Record<string, string> = {
  statement: "Statement",
  report: "Report",
  investment: "Investment document",
  compliance: "Compliance file"
};

export default async function DocumentsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("documents")
    .select("id, category, title, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const documents = data ?? [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Documents</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Institutional document repository</p>
      </div>

      <Card>
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" aria-hidden="true" />}
            title="No documents uploaded"
            description="Statements, reports, and compliance files will appear here as they're issued."
          />
        ) : (
          <CardContent className="flex flex-col gap-3 p-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-md border border-border-default p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{CATEGORY_LABELS[document.category] ?? document.category}</Badge>
                    <span className="text-body-sm font-medium text-text-primary">{document.title}</span>
                  </div>
                  <p className="text-caption text-text-muted">{new Date(document.created_at).toLocaleDateString()}</p>
                </div>
                <DownloadButton documentId={document.id} />
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
