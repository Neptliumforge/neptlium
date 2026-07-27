import { requireAdminUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@neptlium/ui";
import { Zap } from "lucide-react";

// Static capability registry — mirrors apps/app/lib/capabilities.ts
// To make these runtime-toggleable, add a platform_capabilities table and read from it here.
const CAPABILITIES = [
  { key: "walletProvisioning", label: "Wallet Provisioning", status: "disabled", description: "Custody provider is not connected for new users upon completing onboarding." },
  { key: "cryptoDeposits", label: "Crypto Deposits", status: "coming_soon", description: "On-chain crypto deposit addresses for supported networks." },
  { key: "depositAddresses", label: "Deposit Addresses", status: "disabled", description: "Custody provider is not connected." },
  { key: "internalTransfers", label: "Internal Transfers", status: "coming_soon", description: "Transfers between Neptlium accounts via alias handles." },
  { key: "withdrawals", label: "Withdrawals", status: "disabled", description: "Custody provider is not connected." },
  { key: "portfolioCreation", label: "Portfolio Creation", status: "pending_configuration", description: "User-initiated portfolio creation (currently operator-provisioned)." },
  { key: "capitalAllocation", label: "Capital Allocation", status: "enabled", description: "Capital allocation requests from wallet to investment portfolio." },
  { key: "documentUpload", label: "Document Upload", status: "enabled", description: "Upload and manage compliance documents." },
  { key: "reports", label: "Reports & Analytics", status: "pending_configuration", description: "Analytics and reporting features for analysts." },
  { key: "counterparties", label: "Counterparty Management", status: "coming_soon", description: "Manage counterparty entities for transactions." },
  { key: "notifications", label: "Notifications", status: "enabled", description: "In-app notification system." },
  { key: "sessionManagement", label: "Session Management", status: "enabled", description: "Trusted devices, session history, and remote sign-out." },
] as const;

type CapabilityStatus = "enabled" | "coming_soon" | "pending_configuration" | "disabled";

function statusTone(status: CapabilityStatus) {
  switch (status) {
    case "enabled": return "success" as const;
    case "coming_soon": return "neutral" as const;
    case "pending_configuration": return "warning" as const;
    case "disabled": return "danger" as const;
  }
}

function statusLabel(status: CapabilityStatus): string {
  switch (status) {
    case "enabled": return "Enabled";
    case "coming_soon": return "Coming Soon";
    case "pending_configuration": return "Pending Config";
    case "disabled": return "Disabled";
  }
}

export default async function CapabilitiesPage() {
  await requireAdminUser();

  return (
    <div>
      <PageHeader
        title="Capabilities"
        description="Platform feature registry — shows which features are active for users"
      />

      <div className="mb-4 rounded-lg border border-border-default bg-surface-1 px-4 py-3 text-[13px] text-text-muted">
        <span className="font-medium text-text-secondary">Note:</span> Capabilities are currently compile-time configured.
        Runtime toggles require a <code className="font-mono text-[12px]">platform_capabilities</code> database table.
      </div>

      <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-hairline">
                {["Capability", "Key", "Status", "Description"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {CAPABILITIES.map((cap) => (
                <tr key={cap.key} className="hover:bg-surface-1/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="size-3.5 text-text-muted shrink-0" />
                      <span className="font-medium text-text-primary">{cap.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="font-mono text-[11px] text-text-muted">{cap.key}</code>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone(cap.status as CapabilityStatus)}>
                      {statusLabel(cap.status as CapabilityStatus)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-text-muted max-w-[320px]">
                    {cap.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
