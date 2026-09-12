# Neptlium Supabase backend

This directory owns tracked PostgreSQL migration history shared by `apps/app` and `apps/admin`. Treat migrations and containment records as append-only. Never edit applied history; add a reviewed follow-up and validate locally or in staging before a separately authorized process.

```sh
supabase db reset
supabase db lint --level warning
```

Browser access uses publishable credentials and RLS. Service-role credentials remain server-only. Provider verification, custody, ledger, reconciliation, and execution infrastructure are not represented as complete.

## Retired withdrawal endpoint — Gate 01

`functions/process-withdraw/index.ts` is a permanent fail-closed tombstone. It
returns HTTP 410 with `WITHDRAWAL_ENDPOINT_RETIRED` for every method, including
OPTIONS. It reads no request or financial data, initializes no clients, uses no
secrets, calls no providers, and writes no state. It grants no CORS permission
and does not delegate. Never restore legacy behavior or deploy another copy.

`config.toml` covers this endpoint only and keeps `verify_jwt = true`. Do not use
this minimal configuration for `supabase config push`, bulk function deployment,
or `--no-verify-jwt`. Repository configuration is not production evidence.

```sh
node --test supabase/test/process-withdraw-retirement.test.mjs
```

See [Gate 01 evidence and production handoff](../docs/security/GATE_01_PROCESS_WITHDRAW_RETIREMENT.md).
