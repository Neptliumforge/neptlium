import { requireProvisionedUser } from "@/lib/auth";
import { Users } from "lucide-react";
import { Card, CardContent, EmptyState } from "@neptlium/ui";

export default async function CounterpartiesPage() {
  await requireProvisionedUser();

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Counterparties
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Manage approved counterparties for transactions and settlements
        </p>
      </div>
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<Users className="size-5" aria-hidden="true" />}
            title="Counterparty management coming soon"
            description="The ability to add and manage counterparties is not yet available. This feature will allow you to pre-approve counterparties for transactions and capital flows."
          />
        </CardContent>
      </Card>
    </div>
  );
}
