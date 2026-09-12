# Neptlium Supabase backend

This directory owns tracked PostgreSQL migration history shared by `apps/app` and `apps/admin`. Treat migrations and containment records as append-only. Never edit applied history; add a reviewed follow-up and validate locally or in staging before a separately authorized process.

```sh
supabase db reset
supabase db lint --level warning
```

Browser access uses publishable credentials and RLS. Service-role credentials remain server-only. Provider verification, custody, ledger, reconciliation, and execution infrastructure are not represented as complete.

## Retired legacy deposit authority

Keep `process-deposit` absent from production. Its dependency-free HTTP 410 guard
must not regain Stripe, database or balance authority. Do not deploy it merely
for testing, bulk deploy legacy functions, disable JWT verification, or push this
minimal config as complete project configuration. Governed funding requires
settlement evidence, canonical ledger and reconciliation.

Run `node --test supabase/test/*retirement.test.mjs`. See
[Gate 03 evidence](../docs/security/GATE_03_PROCESS_DEPOSIT_RETIREMENT.md).
