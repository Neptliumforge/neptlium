# Gate 03 production foundation

## Observed authority

Canonical main is `ecf40bcd6a310f8efc2d34afb84d5e3cc50ac91b`. Clerk/API Preview #166 is at `421a178`, database recovery #167 is at `66640e3`, and the independent Web PR #168 is at `eddefbd`.

Supabase lists Production `udghxwlhztwxvkjaefjh` and Dev `ntbaoylcrwkowqqvzkno` as healthy, in `us-east-2`. Read-only SQL on Production reported PostgreSQL 17.11, SSL and archive mode enabled, zero public relations, policies or table grants, zero Auth users or identities, and zero Storage buckets and objects. The connector listed zero migrations and Edge Functions. Archive mode is engine configuration. Platform backup availability, retained backups, and restore proof are open.

Vercel reports the following verified Production custom domains. The connector reports Node 24.x on these projects. Deployment history and domain verification are separate from runtime readiness.

| Project | Verified domain | Findings |
| --- | --- | --- |
| Web | `neptlium.com` redirects to `www.neptlium.com` | Clerk key and redirect metadata is shared across Production and Preview. |
| App | `app.neptlium.com` | Sign-in returned HTTP 200. A Supabase URL is shared across Production and Preview. |
| API | `api.neptlium.com` | `GET /v1/status` returned HTTP 503 with `rate_limit_unavailable`. Production database and Clerk variables exist by name. |
| Treasury | `treasury.neptlium.com` | A Supabase URL is shared across Production and Preview. |
| Pay | `pay.neptlium.com` | A Supabase URL is shared across Production and Preview. |
| Admin | `admin.neptlium.com` | Production Clerk variables exist by name. Operator auth remains a separate release boundary. |
| Docs | `docs.neptlium.com` | No matching Supabase URL metadata was listed. |
| Status | `status.neptlium.com` | No matching Supabase URL metadata was listed. |

The most recent ready Production records returned for App and API are at `c2bd256e`; Web is at `ef560ffa`. Recent Production records for the other surfaces were canceled. Their runtime application behavior was not certified. The API status response does not identify its database target.

### Isolation correction

Inventory effective Production and Preview destination **project refs** for each server and browser binding, including old signed deployments still serving approved domains. Review the target ref in an approved environment without exposing key material. Split shared Supabase URL and Clerk bindings into separate Production and Preview targets. Use `udghxwlhztwxvkjaefjh` for production data and approved non-production bindings for Preview. Recheck resolved DNS, TLS, env scopes, exact deployment SHA, API health and provider capability flags after any separately approved release. Existing masked bindings prevent proof of isolation today.

## Clerk Production preparation

The connected Neptlium Clerk application lists Development only. Production instance creation is irreversible and requires explicit owner consent. After approval, create a separate Production instance in that Clerk application, select the verified domain, review inherited settings, publish only the DNS records returned by Clerk, and confirm its frontend origin, TLS and signing keys. Approval to create an instance is separate from approval to enable customer login.

The proposed API token audience is `neptlium-api`. Record the exact production Clerk HTTPS issuer once verified on a dedicated `neptlium.com` subdomain. The authorized party is strictly `https://app.neptlium.com`. Approve sign-in, sign-up, callback and recovery destinations on that App origin and test the existing internal return-path rules. Keep Preview origins, template values and credentials scoped to Development. Provision the Production server key through server-only secret storage and the matching publishable key for App. Verify cookie security, session lifetime, sign-out, recovery email delivery, MFA, Clerk session revocation and key rotation with an exact-deployment test. Keep sensitive authorization and risk checks behind the API.

The staged API gate reuses the independent RS256 verifier, requires production deployment and named release certifications, rejects Development issuer and audience, and checks active principal and requested membership through injected durable lookup contracts. It is unregistered. Before activation, supply an independently managed issuer-pinned JWKS loader, a reviewed durable production resolver and tenant membership store, and verify the real signed token. Prove existing-account continuity without email-based linking, and implement idempotent new-customer bootstrap before advertising onboarding. Test revoked Clerk sessions distinctly from revoked Neptlium identity links and memberships. Clerk identity and organization membership authorize identity context only. Wallet, ledger, and money movement require their existing account, policy, audit and idempotency controls.

## Production-specific recovery and install gate

1. Verify the exact Production project and effective callers. Obtain a restricted Production backup connection through approved secret management and verify TLS against the reviewed host. Establish the platform retention and restore options independently. Use a quiescent or consistent-snapshot logical archive covering application schemas, rows, sequences, migration history, exportable roles and grants. Inventory managed Auth, Storage object data and configuration, extension prerequisites and separately held signing material. Record checksum and protected offsite retention.
2. Restore that exact encrypted Production archive to a disposable, access-controlled Supabase-compatible target. Verify checksum, schemas, policies, roles/grants, migration versions, record counts and ledger ownership. Record managed restore prerequisites and any exclusions. The disposable Gate 02F replay and Gate 02J synthetic backup are useful rehearsals. Production recovery requires its own archive and proof.
3. Recheck the target and run the reviewed planner in #167 against its actual history. The observed empty history passes the pinned 50-file check and lists 50 pending versions. Run the release tool dry run only after connecting to the verified target under the approved procedure. Review false-empty drift, legacy policy/function retirement, Auth prerequisites and recovery evidence. Obtain separate explicit owner approval before installing on the exact Production ref.
4. Keep historical obligations and external evidence under separate reconciled custody. The fresh canonical ledger starts from authorized ledger events. Keep all provider execution and financial writes gated through release review and preserve immutable audit and idempotency data.

## Certification

| Surface | Status |
| --- | --- |
| Clerk | BLOCKED. Production instance, DNS, key identity, sessions, recovery and revocation require approval and verification. |
| Supabase | PASS for read-only inventory and planner compatibility. BLOCKED for archive, isolated Production restore and migration approval. |
| API | FAIL for observed Production status endpoint. Staged Clerk candidate passes signed fixture and fail-closed membership tests. |
| App | PASS for serving the current sign-in page. BLOCKED for Clerk Production and activation. |
| Wallet | BLOCKED for hosted ownership certification. Existing source and fixtures exercise owner scope and fail-closed provisioning. |
| Capital | BLOCKED for hosted ledger authorization. Existing canonical balance fixtures remain the regression gate. |
| Treasury | BLOCKED for hosted ownership and approval controls. Existing wallet/destination and approval tests remain required. |
| Pay | BLOCKED for hosted provider and payment authorization. Keep the execution capability disabled. |

## Gate 03B provisioning and recovery evidence

### Clerk domains and approval

Clerk still reports a Development-only Neptlium application. Its domain inventory cannot return a Production frontend endpoint before a Production instance exists. For the approved App origin `https://app.neptlium.com`, plan on the owned root `neptlium.com` and review the exact domain fields with the owner before the irreversible Production instance creation. Clerk documents `accounts.<root>` as the default **Account Portal** hostname. The preferred `accounts.neptlium.com` therefore describes the desired portal. Confirm the distinct actual Frontend API origin and the issuer from Clerk's returned Production configuration and a signed token. Obtain separate approval for any DNS changes, then publish only Clerk's returned records. [Clerk production deployment](https://clerk.com/docs/guides/development/deployment/production) · [Account Portal](https://clerk.com/docs/guides/account-portal/getting-started)

Keep the Production origin allowlist restricted to `https://app.neptlium.com`; explicitly approve exact sign-in, sign-up and recovery return destinations and the chosen OAuth callback paths. The Production audience contract is `neptlium-api`. Record `iss`, `aud`, `azp`, signature and expiry only as redacted verification outcomes. Keep Production keys in separate server-only/public scopes as appropriate and keep router registration and certification switches disabled pending real signed-session evidence and rollback review.

### Production backup connection

The approved project is `udghxwlhztwxvkjaefjh` in `us-east-2`; its direct database host is `db.udghxwlhztwxvkjaefjh.supabase.co`. SQL reports SSL enabled. Actual backup-client TLS and credential scope remain unverified. Use an owner-approved existing backup role and temporary credential through protected secret storage. Use the project's trusted CA, strict hostname verification, and a read-only client default. If the direct endpoint is unavailable to the runner, use the dashboard-verified **session** pooler with project-scoped username and strict TLS. Privilege scope must support reading every approved application relation and metadata needed for recovery. Escalate missing role-operation permissions to the owner instead of creating or modifying Production roles.

Check schema, rows, migration ledger, exportable roles and ACLs. Exclude role password verifiers. Encrypt the archive to an approved public recipient before retention, record an external checksum, and restore into a network-isolated Supabase-compatible target. Verify role grantors, schema, grants, RLS, rows and migration history before accepting the archive. Inventory managed Auth users, identities, signing material, Storage metadata and object content, managed settings, extensions and backup coverage separately. Gate 02J's Dev script is deliberately target-pinned and its fixture rehearsal does not certify Production. The restricted Production connection is not yet available; no Production archive or restore was attempted.

The Production history table is still absent and the connector lists zero migrations. The Gate 02F replay and pinned 50-file planner cover the further installation plan. Repeat the target-specific plan and release-tool dry run after verified recovery, then ask for separate migration approval. Never infer that an empty migration history alone makes a database safe to install into.

### Vercel and readiness

Rechecked the Production scope metadata for Web, App, API, Treasury, Pay, Admin, Docs, and Status. Web shares Clerk keys and sign-in/redirect fields across environments. App, Treasury and Pay share the Supabase URL and publishable key across environments. Effective masked destinations and the provenance of Production-labeled Clerk settings remain unverified. Separate the scopes only during an approved release after an owner confirms effective project and instance refs for the deployed revisions.

On the approved Production database, both `public.api_rate_limits` and `public.consume_api_rate_limit(text,integer,integer)` are absent. Migration `20260815115118` installs that durable RPC with service-role-only execution. The API's observed `503 rate_limit_unavailable` is consistent with the missing dependency if the deployment points at the approved project. The masked effective database target and connectivity prevent proving the live cause. Verify the actual target and credential scope without invoking the mutating limiter RPC on Production. Preserve fail-closed behavior; the code rejects redirect responses and malformed or ambiguous limiter decisions with the existing 503 shape.
