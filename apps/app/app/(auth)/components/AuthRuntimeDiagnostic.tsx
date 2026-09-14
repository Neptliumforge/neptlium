function RuntimeNotice({ detail }: { readonly detail: string }) {
  return (
    <div
      className="w-full border border-border-subtle bg-surface-primary px-4 py-3"
      role="status"
      aria-live="polite"
      data-auth-runtime-state="server-verified"
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
        Supabase Auth
      </p>
      <p className="mt-1 text-sm leading-6 text-text-muted">{detail}</p>
    </div>
  );
}

export function AuthRuntimeDiagnostic() {
  return (
    <div className="space-y-2" data-auth-runtime-diagnostic>
      <RuntimeNotice detail="Authentication is verified through the Neptlium server session boundary." />
    </div>
  );
}
