# Supabase

Supabase provides authentication, PostgreSQL data, RLS, Storage, and migration history. `apps/app` and `apps/admin` share the backend; `apps/web` remains deployable without privileged access.

Browser clients use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Only trusted server code may use `SUPABASE_SERVICE_ROLE_KEY`.

Migrations are append-only. Never edit an applied migration or containment record; add a reviewed follow-up and validate locally or in staging.

```sh
supabase db reset
supabase db lint --level warning
```

Repository work does not authorize linking to or modifying remote Supabase.
