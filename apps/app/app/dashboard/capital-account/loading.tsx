export default function CapitalAccountLoading() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-live="polite"
      aria-label="Loading Capital Account"
    >
      <div className="border-b border-border-hairline pb-6">
        <div className="h-3 w-20 bg-surface-2" />
        <div className="mt-3 h-9 w-56 bg-surface-2" />
        <div className="mt-3 h-4 w-full max-w-lg bg-surface-2" />
      </div>
      <div className="h-44 border-y border-border-hairline bg-surface-1" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2" aria-hidden="true">
        <div className="h-28 border-y border-border-hairline bg-surface-1" />
        <div className="h-28 border-y border-border-hairline bg-surface-1" />
      </div>
      <span className="sr-only">Loading account state</span>
    </div>
  );
}
