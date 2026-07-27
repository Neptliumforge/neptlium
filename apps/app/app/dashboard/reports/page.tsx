import { FileBarChart2 } from "lucide-react";
import { Card, EmptyState } from "@neptlium/ui";
import { requireRole } from "@/lib/auth";

export default async function ReportsPage() {
  await requireRole("analyst");

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Reports</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Institutional statements, performance summaries, and audit reports
        </p>
      </div>

      <Card>
        <EmptyState
          icon={<FileBarChart2 className="size-5" aria-hidden="true" />}
          title="No reports available"
          description="Connect to Supabase to generate institutional reports."
        />
      </Card>
    </div>
  );
}
