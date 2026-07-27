# Supabase

Supabase is Neptlium's authoritative backend for authentication, PostgreSQL data, Row Level Security, Storage, and database migrations.

Application clients are provided by `@neptlium/lib`:

- browser client for client components
- request-scoped server client for server components and actions
- middleware client for session refresh
- server-only admin client for narrowly scoped privileged operations

Use the local CLI only with an explicitly selected local or staging project. Review migrations before applying them and never place secrets in tracked files.

```sh
supabase db reset
supabase db lint --level warning
```

Production changes require a separate reviewed deployment process. Repository documentation and migrations do not authorize remote application.
