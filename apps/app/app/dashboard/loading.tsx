export default function DashboardLoading() {
  return (
    <div
      className="py-6 sm:py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading your Neptlium account"
    >
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-primary">
        Neptlium
      </p>
      <h1 className="mt-2">Loading your account…</h1>
      <div className="mt-8 max-w-3xl space-y-3" aria-hidden="true">
        <div className="h-28 rounded-lg border border-border-hairline bg-surface-2" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-lg border border-border-hairline bg-surface-1" />
          <div className="h-20 rounded-lg border border-border-hairline bg-surface-1" />
          <div className="h-20 rounded-lg border border-border-hairline bg-surface-1" />
        </div>
      </div>
      <span className="sr-only">Preparing your personal Capital workspace.</span>
    </div>
  );
}
