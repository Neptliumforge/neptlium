import { ShieldAlert } from "lucide-react";
import { Card, EmptyState } from "@neptlium/ui";
import { requireProvisionedUser } from "@/lib/auth";

export default async function RiskPage() {
  await requireProvisionedUser();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">
          Capital Health
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Review liquidity, concentration, reserve position, and allocation
          balance
        </p>
      </div>

      <Card>
        <EmptyState
          icon={<ShieldAlert className="size-5" aria-hidden="true" />}
          title="Capital health unavailable"
          description="No database-backed liquidity, concentration, reserve, or allocation data is available. Review your portfolio data and connected providers."
        />
      </Card>
    </div>
  );
}
