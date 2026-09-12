# @neptlium/api

Privileged Node.js/TypeScript API for `api.neptlium.com`.

> **Production remediation mode:** The API is the canonical execution boundary, but the platform is not production-complete until the gates in `../../docs/15_PRODUCTION_READINESS_AUDIT.md` are closed with runtime evidence.

## Current authority

`apps/api` owns authenticated financial commands, provider isolation, durable state transitions, ledger interaction, reconciliation, rate limiting, and audit boundaries.

Current source includes substantial governed financial infrastructure, including funding/transfer lifecycle contracts, provider webhook inbox control-plane, ledger/reconciliation functions, Clerk/Supabase identity transition support, and Circle provider code. However, legacy Supabase Edge Functions can still bypass this authority in production and the canonical financial lifecycle has not yet been exercised end-to-end.

## Immediate execution requirements

The API remediation sequence is:

1. become the only financial mutation authority after legacy Edge Functions are disabled/retired;
2. remove any client-side transaction truth creation path;
3. complete Circle approved-transfer -> provider submission -> durable provider reference -> submitted orchestration;
4. authenticate and persist Circle/Alchemy/Stripe provider events through `provider_webhook_inbox`;
5. produce durable settlement evidence;
6. post only-once balanced canonical journals;
7. reconcile provider/treasury evidence against customer liabilities;
8. prove complete funding and withdrawal lifecycles;
9. support the final Clerk identity cutover;
10. pass production environment-variable/runtime certification.

## Required financial rules

- persist intent/execution state before irreversible provider effects where the provider contract permits;
- use deterministic idempotency for provider submission;
- never equate provider acceptance with settlement;
- never equate settlement with reconciliation;
- treat unknown provider outcome as unknown/recoverable;
- never use process memory as production financial authority;
- fail closed when auth, policy, provider capability, durability, evidence, or reconciliation prerequisites are unavailable.

## Provider ingress

The canonical inbound pattern is:

```text
provider request
  -> official signature/authentication verification
  -> provider_webhook_inbox persistence
  -> dedupe/replay protection
  -> idempotent processing
  -> provider-reference/settlement-evidence linkage
  -> lifecycle transition
  -> ledger/reconciliation
```

Legacy direct Stripe/crypto/deposit mutation behavior must not remain authoritative.

## Identity

Clerk is implemented in current source and is the target browser/session authority. Production remains transitional until the Supabase-to-Clerk cutover gate is complete. API authorization must resolve external identity to canonical Neptlium principals and server-side roles/compliance state.

## Environment

All provider/service credentials are server-only. Production environment verification must confirm variable presence, environment/project scope, and successful runtime use without exposing values.

## Commands

```sh
pnpm --filter @neptlium/api dev
pnpm --filter @neptlium/api test
pnpm --filter @neptlium/api build
```

Architecture: [`docs/11_API_ARCHITECTURE.md`](../../docs/11_API_ARCHITECTURE.md)  
Execution ledger: [`docs/15_PRODUCTION_READINESS_AUDIT.md`](../../docs/15_PRODUCTION_READINESS_AUDIT.md)
