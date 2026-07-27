import { Newspaper } from "lucide-react";
import { Card, EmptyState } from "@neptlium/ui";
import { requireUser } from "@/lib/auth";

export default async function ResearchPage() {
  await requireUser();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Research</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Market insight and institutional research coverage</p>
      </div>

      <Card>
        <EmptyState
          icon={<Newspaper className="size-5" aria-hidden="true" />}
          title="No research available"
          description="Research coverage will appear here as it's published."
        />
      </Card>
    </div>
  );
}
