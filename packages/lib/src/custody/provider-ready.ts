/**
 * provider-ready.ts
 *
 * Reports whether an external custody/payments provider is configured and
 * operational. Today only the InternalLedgerCustodyProvider exists — a real,
 * database-backed ledger that records transactions but has no connection to any
 * external payment rail or blockchain network.
 *
 * UI components use this to show truthful empty states (e.g. "Crypto deposits
 * are not enabled until a configured provider assigns an address") rather than
 * rendering actions that cannot execute.
 *
 * When a real external provider is integrated (Fireblocks, Copper, an external
 * custody adapter), that integration should register itself here using
 * the environment variables listed below.
 *
 * Never import this file from client components — server only.
 */

export interface ProviderReadiness {
  /** Stable identifier for this provider. */
  readonly providerId: string;
  /** Whether this provider can execute real transactions right now. */
  readonly ready: boolean;
  /** Human-readable reason — for logs and admin tooling, not end-user UI copy. */
  readonly reason: string;
}

/**
 * Returns the readiness state of the active custody provider.
 *
 * Called in Server Components and Server Actions. Never exposed to the client
 * bundle — import only from server-side code.
 */
export function checkCustodyProviderReady(): ProviderReadiness {
  if (isExternalCustodyProviderConfigured()) {
    return {
      providerId: process.env.CUSTODY_PROVIDER_ID ?? "external",
      ready: true,
      reason: "External custody provider is configured via environment variables."
    };
  }

  return {
    providerId: "internal",
    ready: true,
    reason:
      "Internal ledger is operational. No external custody provider is configured. " +
      "Deposits and withdrawals are recorded as pending and must be reconciled " +
      "manually by operations staff against verified provider activity."
  };
}

/**
 * Returns true only when a real external custody integration is configured.
 * Currently always false — no external provider exists in this codebase.
 *
 * Required environment variables for an external provider:
 *   CUSTODY_PROVIDER_ID       — stable slug (e.g. "fireblocks", "copper")
 *   CUSTODY_PROVIDER_URL      — base URL of the provider REST API
 *   CUSTODY_PROVIDER_API_KEY  — secret API key (server-only; never expose to browser)
 */
export function isExternalCustodyProviderConfigured(): boolean {
  return Boolean(
    process.env.CUSTODY_PROVIDER_ID &&
      process.env.CUSTODY_PROVIDER_URL &&
      process.env.CUSTODY_PROVIDER_API_KEY
  );
}
