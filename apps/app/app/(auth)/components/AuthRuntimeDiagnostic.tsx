import { ClerkDegraded, ClerkFailed, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

function RuntimeNotice({
  state,
  detail,
}: {
  readonly state: 'loading' | 'loaded' | 'degraded' | 'failed';
  readonly detail: string;
}) {
  const failed = state === 'failed';

  return (
    <div
      className="w-full border border-border-subtle bg-surface-primary px-4 py-3"
      role={failed ? 'alert' : 'status'}
      aria-live="polite"
      data-auth-runtime-state={state}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
        Clerk runtime: {state}
      </p>
      <p className="mt-1 text-sm leading-6 text-text-muted">{detail}</p>
    </div>
  );
}

export function AuthRuntimeDiagnostic() {
  return (
    <div className="space-y-2" data-auth-runtime-diagnostic>
      <ClerkLoading>
        <RuntimeNotice
          state="loading"
          detail="The Clerk client has not reported ready yet."
        />
      </ClerkLoading>

      <ClerkLoaded>
        <RuntimeNotice
          state="loaded"
          detail="The Clerk client reported ready or degraded."
        />
        <ClerkDegraded>
          <RuntimeNotice
            state="degraded"
            detail="The Clerk client is partially operational."
          />
        </ClerkDegraded>
      </ClerkLoaded>

      <ClerkFailed>
        <RuntimeNotice
          state="failed"
          detail="The Clerk client failed to initialize."
        />
      </ClerkFailed>
    </div>
  );
}
