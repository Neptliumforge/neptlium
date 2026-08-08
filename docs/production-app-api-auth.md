# Production app/API authentication

The authenticated application uses Supabase cookie sessions and validates identity with `auth.getUser()` on the server. Canonical routes are `/auth/sign-up`, `/auth/sign-in`, `/auth/confirm`, and `/dashboard`. Redirect destinations are restricted to relative paths.

`apps/app/lib/api/client.ts` is the only app-to-API boundary. It is server-only, validates `NEPTLIUM_API_URL`, obtains the current access token from the server session, and forwards it as a bearer token with a request ID. It retries only GET requests and never forwards browser cookies cross-origin.

The API validates the bearer token against Supabase Auth before deriving the user ID. `POST /v1/account/provision` ignores browser-supplied ownership and calls the service-role-only `provision_account` RPC with the validated user ID. The RPC is idempotent and creates only the minimum profile record. It grants no roles, balances, custody, addresses, signing, execution, deposits, or withdrawals.

## Environment contract

App runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://app.neptlium.com`
- `NEPTLIUM_API_URL=https://api.neptlium.com`

API runtime:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (API only; never public)
- `API_ALLOWED_ORIGINS=https://app.neptlium.com`

The migration `20260731130000_atomic_account_provisioning.sql` is review-only until an operator explicitly approves and applies it. Builds do not require the service-role secret. Production deployment and remote migration application are separate, explicitly authorized steps.
