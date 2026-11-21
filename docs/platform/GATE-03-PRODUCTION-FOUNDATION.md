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
