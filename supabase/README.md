# Neptlium Supabase backend

This directory owns tracked PostgreSQL migration history shared by `apps/app` and `apps/admin`. Treat migrations and containment records as append-only. Never edit applied history; add a reviewed follow-up and validate locally or in staging before a separately authorized process.

```sh
supabase db reset
supabase db lint --level warning
```

Browser access uses publishable credentials and RLS. Service-role credentials remain server-only. Provider verification, custody, ledger, reconciliation, and execution infrastructure are not represented as complete.

## Retired crypto webhook

`crypto-webhook` is retired. Its tracked entrypoint is a dependency-free HTTP 410
guard, not a provider ingress implementation. Keep the slug absent from
production; do not deploy it, bulk deploy legacy functions, disable JWT
verification, or restore the sample handler. The minimal `config.toml` only pins
this guard and must not be pushed as global project configuration. Provider
events require the governed Neptlium API/provider ingress architecture.

Run `node --test supabase/test/*retirement.test.mjs` to verify retirement guards.
See [Gate 02 evidence](../docs/security/GATE_02_CRYPTO_WEBHOOK_RETIREMENT.md).
