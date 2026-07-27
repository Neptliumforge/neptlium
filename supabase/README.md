# Neptlium Supabase backend

This directory owns tracked PostgreSQL migration history shared by `apps/app` and `apps/admin`. Treat migrations and containment records as append-only. Never edit applied history; add a reviewed follow-up and validate locally or in staging before a separately authorized process.

```sh
supabase db reset
supabase db lint --level warning
```

Browser access uses publishable credentials and RLS. Service-role credentials remain server-only. Provider verification, custody, ledger, reconciliation, and execution infrastructure are not represented as complete.
