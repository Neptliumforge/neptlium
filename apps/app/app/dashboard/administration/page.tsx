import { ShieldCheck } from "lucide-react";
import { Card, EmptyState } from "@neptlium/ui";
import { requireRole } from "@/lib/auth";

export default async function AdministrationPage() {
  await requireRole("admin");

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Administration</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Platform governance, roles, and system oversight</p>
      </div>

      <Card>
        <EmptyState
          icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          title="No administrative actions pending"
          description="User, role, and platform governance tools will appear here."
        />
      </Card>
    </div>
  );
}
