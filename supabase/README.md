# Neptlium Supabase backend

This directory contains the tracked PostgreSQL migration history for Neptlium's shared Supabase backend.

Treat migrations as append-only production history. Do not edit an applied migration to change behavior; add a reviewed follow-up migration instead. Validate locally or in staging before any remote apply.

```sh
supabase db reset
supabase db lint --level warning
```

The backend is shared by `apps/app`, `apps/admin`, and the planned `apps/web`. Authentication, RLS, auditability, and provider verification remain mandatory boundaries.
