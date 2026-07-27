import { SlidersHorizontal } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from "@netlium/ui";
import { createSupabaseServerClient } from "@netlium/lib/supabase/server";
import { InternalLedgerCustodyProvider } from "@netlium/lib";
import { requireProvisionedUser } from "@/lib/auth";
import {
  AllocationRequestForm,
  type AssetNetworkPair,
} from "./AllocationRequestForm";

const STATUS_TONE: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  pending_review: "warning",
  approved: "success",
  executed: "success",
  rejected: "danger",
  cancelled: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  executed: "Executed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default async function AllocationsPage() {
  const { user } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const [walletResult, portfolioResult, requestsResult] = await Promise.all([
    supabase
      .from("wallets")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("investment_portfolios")
      .select("id, name")
      .eq("profile_id", user.id),
    supabase
      .from("capital_allocation_requests")
      .select("id, asset, network, amount, status, notes, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const wallet = walletResult.data;
  const portfolios = portfolioResult.data ?? [];
  const requests = requestsResult.data ?? [];

  // Build asset/network pairs from the custody provider
  const pairs: AssetNetworkPair[] = [];
  if (wallet) {
    const provider = new InternalLedgerCustodyProvider(supabase);
    const assets = await provider.listSupportedAssets();
    for (const asset of assets) {
      const networks = await provider.listSupportedNetworks(asset.code);
      for (const network of networks) {
        pairs.push({
          assetCode: asset.code,
          assetLabel: asset.label,
          networkCode: network.code,
          networkLabel: network.label,
        });
      }
    }
  }

  const walletOptions = wallet
    ? [{ id: wallet.id, label: "Primary wallet" }]
    : [];

  // Compute summary stats
  const totalAllocated = requests
    .filter((r) => r.status === "executed" || r.status === "approved")
    .reduce((s, r) => s + Number(r.amount), 0);

  const pendingCount = requests.filter(
    (r) => r.status === "pending_review",
  ).length;

  function fmtAmount(n: number) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Capital Allocations
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Submit and track capital allocation requests across your portfolios
        </p>
        <p className="mt-2 text-[12px] font-medium text-accent-primary">
          Illustrative. Modeling does not move capital.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Allocated"
          value={totalAllocated > 0 ? `$${fmtAmount(totalAllocated)}` : "—"}
        />
        <StatCard
          label="Pending Review"
          value={pendingCount > 0 ? String(pendingCount) : "—"}
        />
        <StatCard
          label="Available Capital"
          value={wallet ? "—" : "No wallet"}
        />
      </div>

      {/* Main two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Left: Allocation requests list */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <EmptyState
                icon={
                  <SlidersHorizontal className="size-5" aria-hidden="true" />
                }
                title="No allocation requests yet"
                description="Submit a request using the form to allocate capital from your wallet."
              />
            ) : (
              <div className="divide-y divide-border-hairline">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-text-primary font-mono">
                          {Number(req.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {req.asset}
                        </p>
                        <span className="text-[12px] text-text-muted">
                          via {req.network}
                        </span>
                      </div>
                      {req.notes && (
                        <p className="mt-1 truncate text-[12px] text-text-muted">
                          {req.notes}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-text-muted">
                        {new Date(req.created_at).toLocaleDateString(
                          undefined,
                          {
                            dateStyle: "medium",
                          },
                        )}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Badge tone={STATUS_TONE[req.status] ?? "neutral"}>
                        {STATUS_LABEL[req.status] ??
                          req.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: New request form */}
        <Card>
          <CardHeader>
            <CardTitle>New Request</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationRequestForm
              wallets={walletOptions}
              portfolios={portfolios}
              pairs={pairs}
            />
          </CardContent>
        </Card>
      </div>

      {/* Portfolio summary (only if portfolios exist) */}
      {portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border-hairline">
              {portfolios.map((portfolio) => {
                const portfolioRequests = requests.filter(() => true); // join not available without portfolio_id on requests
                return (
                  <div
                    key={portfolio.id}
                    className="flex items-center justify-between py-3"
                  >
                    <p className="text-[13px] font-medium text-text-primary">
                      {portfolio.name}
                    </p>
                    <Badge tone="neutral">
                      {portfolioRequests.length} request
                      {portfolioRequests.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
