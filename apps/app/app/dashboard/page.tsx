import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Briefcase,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from "@neptlium/ui";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireProvisionedUser } from "@/lib/auth";

const tone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  pending: "warning",
  pending_review: "warning",
  failed: "danger",
  cancelled: "neutral",
};
export default async function DashboardPage() {
  const { profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();
  const { data: activity, error } = await supabase
    .from("wallet_transactions")
    .select("id,type,asset,network,amount,status,created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-text-muted">
          A concise view of your current capital operations.
        </p>
      </header>
      <section
        aria-label="Capital summary"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {(
          [
            ["Total Capital", "Valuation data unavailable"],
            ["Available Capital", "Liquidity data unavailable"],
            ["Allocated Capital", "Allocation data unavailable"],
            ["Reserve Capital", "Reserve data unavailable"],
          ] as const
        ).map(([label, detail]) => (
          <StatCard key={label} label={label} value="—" delta={detail} />
        ))}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<SlidersHorizontal className="size-5" />}
              title="Allocation unavailable"
              description="No reporting-value allocation data is configured for this account."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Capital Health Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Gauge className="size-5" />}
              title="Health context unavailable"
              description="Liquidity, concentration, reserve, and allocation data are required before capital health can be summarized."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/portfolio"
              className="flex min-h-11 items-center gap-3 rounded-md border border-border-default px-3 text-sm"
            >
              <Briefcase className="size-4" />
              Review portfolio data
              <ArrowRight className="ml-auto size-4" />
            </Link>
            <Link
              href="/dashboard/allocations"
              className="flex min-h-11 items-center gap-3 rounded-md border border-border-default px-3 text-sm"
            >
              <SlidersHorizontal className="size-4" />
              Model an allocation scenario
              <ArrowRight className="ml-auto size-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <EmptyState
                icon={<Activity className="size-5" />}
                title="Activity failed to load"
                description="Recent capital activity is unavailable. Refresh the page or try again later."
              />
            ) : !activity?.length ? (
              <EmptyState
                icon={<Activity className="size-5" />}
                title="No recent activity"
                description="Database-backed activity will appear here when available."
              />
            ) : (
              <div className="divide-y divide-border-hairline">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-12 items-center justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm capitalize">{item.type}</p>
                      <p className="truncate text-xs text-text-muted">
                        {item.asset} · {item.network}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-sm">
                        {Number(item.amount).toLocaleString()} {item.asset}
                      </span>
                      <Badge tone={tone[item.status] ?? "neutral"}>
                        {item.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
