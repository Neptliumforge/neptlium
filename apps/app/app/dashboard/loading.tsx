export default function DashboardLoading() {
  return (
    <div className="py-3 sm:py-5" role="status" aria-live="polite" aria-label="Loading governed account state">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent-primary">Neptlium</p>
      <h1 className="mt-2">Loading capital state</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
        Retrieving governed account, capital, treasury, and allocation state from the Neptlium API.
      </p>
      <div className="mt-8 max-w-3xl border-y border-border-hairline" aria-hidden="true">
        <div className="h-12 border-b border-border-hairline bg-surface-2" />
        <div className="h-12 border-b border-border-hairline bg-surface-1" />
        <div className="h-12 bg-surface-2" />
      </div>
    </div>
  );
}
