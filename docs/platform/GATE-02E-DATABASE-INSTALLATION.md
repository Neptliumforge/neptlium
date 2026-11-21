# Gate 02E database installation and Clerk Preview

## Scope and authority

The installation manifest pins the canonical migration bytes at `ecf40bcd6a310f8efc2d34afb84d5e3cc50ac91b`. The migration order is the manifest order. The phases below are review checkpoints in that sequence. Each migration needs its normal Supabase migration boundary and history record, including the separate transfer enum changes.

| Ordered checkpoint | Review before proceeding |
| --- | --- |
| `20260710104755`–`20260717140000` | Managed Supabase baseline, required extensions, Auth and Storage prerequisites, profiles, organizations, role grants and RLS. Confirm provider and cron side effects are disabled. |
| `20260720190000`–`20260809163555` | Capital and onboarding foundation, security containment and atomic account provisioning. Confirm an identity alone has no funding authority. |
| `20260811161123`–`20260817134500` | Funding, Treasury and wallet destinations, governed financial operations, ledger, allocation, rate limits and transfer approval. Validate posting balance, append-only history and idempotency. |
| `20260825051902`–`20260908091732` | Preserved principal IDs, historical provider-linking migrations, self-custody Treasury, thesis records and provider/webhook ingress. Review grants and delivery replay behavior. |
| `20260910132119`–`20260914174500` | Allocation and webhook hardening, legacy authority retirement, observations, platform owners, tenant memberships and audit. The historical Supabase Auth-only migration revokes active Clerk links and removes the older bootstrap functions. A reviewed forward migration is needed for a Clerk-first runtime. |
| `20261021190000`–`20261021200000` | Profile write containment, onboarding standing and canonical Capital ledger initialization. Open ledgers start with no postings. Verify unavailable, uninitialized and initialized-zero states separately. |

## Execution and recovery

1. Confirm the target identity, engine version, managed schemas, extensions, grants, migration history and public objects. Isolated Dev is `ntbaoylcrwkowqqvzkno`. The replacement target is `udghxwlhztwxvkjaefjh` and requires separate approval before writes. An empty history alone does not prove the public schema is empty.
2. Export the target's ordered migration versions as a JSON array of strings. An empty array is valid only after confirming zero applied versions. Run `node supabase/scripts/schema-install-plan.mjs /path/to/migration-history.json`. It checks the exact SQL bytes and rejects a non-prefix history. Review the Supabase CLI dry run against the same named target before any push. Use per-migration transactions and history records. Stopping on an error preserves the exact version boundary for diagnosis.
3. On a disposable Supabase project, replay all 50 versions with the release tool and run the canonical-balance, funding and transfer lifecycle, webhook replay, wallet, authorization, and audit checks. Use synthetic principals from two tenants. Verify deny-by-default grants, no cross-tenant access, balanced posting and compensating-entry behavior, stable owner IDs, duplicate intent handling, and absence of provider execution. Capture versions and test results. Repeat the dry run and confirm no pending migrations. The Gate 02E rollback-only Dev probe covers identity and ownership dependencies; full replay remains a separate gate.
4. Record the replacement target fingerprint and pre-install inventory, then acquire an approved schema and data backup, verify a restore on a separate target, and record relevant storage and Auth metadata and recovery owners. Keep deployment routing and payment execution disabled during installation. A partial install needs inspection and either a reviewed forward correction or separately approved restoration. Do not rewrite migration history to force a match.
5. Inventory historical obligations separately, including balances, unresolved transfers, liabilities, reconciliation differences, evidence hashes and authorized custodians. Reconcile using a separately approved process. Provider balances and historical obligations do not initialize or credit the fresh ledger.

## Clerk Preview trust

The Clerk development Frontend API derived from the Development instance's publishable metadata is `https://arriving-pup-3595.clerk.accounts.dev`. Match `iss` to this exact origin only after confirming an actual Preview token. Signing keys are loaded from `/.well-known/jwks.json` under that issuer. The proposed API audience is `neptlium-api-preview` and proposed JWT template name is `neptlium-preview`. The template must be created or confirmed in Clerk, then its issued `aud` verified. The authorized party `azp` must exactly match the designated HTTPS App Preview origin. Select stable Preview origins before testing.

| Project | Preview-only settings |
| --- | --- |
| `neptlium-app` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, server-only `CLERK_SECRET_KEY`, `NEPTLIUM_API_AUTH_PROVIDER=clerk-preview`, `NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN`, `NEPTLIUM_CLERK_PREVIEW_API_ORIGIN`, `NEPTLIUM_CLERK_PREVIEW_TOKEN_TEMPLATE` |
| `neptlium-api` | `NEPTLIUM_API_AUTH_PROVIDER=clerk-preview`, `NEPTLIUM_CLERK_PREVIEW_ISSUER`, `NEPTLIUM_CLERK_PREVIEW_AUDIENCE`, `NEPTLIUM_CLERK_PREVIEW_APP_ORIGIN`, `NEPTLIUM_CLERK_PREVIEW_SUPABASE_URL`, server-only `NEPTLIUM_CLERK_PREVIEW_SUPABASE_SERVICE_ROLE_KEY`, and the verifier, identity resolver and tenant isolation certification flags described in Gate 02 |

The App has both Preview key bindings. Their values were left unread, and the API Preview trust bindings are absent. The hosted gate needs an actual Clerk token and an isolated migrated database. Do not enable customer cutover or financial execution during verification.
