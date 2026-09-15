export default function DashboardLoading() {
  return (
    <div className="py-8 sm:py-12" role="status" aria-live="polite" aria-label="Loading your Neptlium account">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-primary">Neptlium</p>
      <h1 className="mt-2">Loading your account…</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-hidden="true">
        <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
      </div>
    </div>
  );
}
