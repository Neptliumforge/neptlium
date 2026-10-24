# Clerk authentication development transition

Status: DEVELOPMENT IMPLEMENTATION. Not a production cutover.

## Current, transition and target

CURRENT production authentication remains Supabase Auth. This branch adds the owner-approved Clerk architecture to apps/app and apps/api, opt-in with test keys. Admin and Treasury retain their existing session provider. No production environment, DNS, database, or deployment is changed. Never merge or enable this transition as part of routine branch completion.

TRANSITION identity chain: Clerk immutable subject -> stable Neptlium principal UUID -> personal profile/account -> optional organization membership -> server-owned policy/capability -> governed API authority. A session, verified email, wallet signature, or completed onboarding grants no financial permission.

TARGET activation requires a separately reviewed development instance and database, end-to-end acceptance, and separate approval for any future production cutover. Historical Clerk migrations remain historical; this implementation neither reactivates retired mappings nor migrates credentials.

## Development setup

Use the checked-in .env.clerk-development.example files for App and API. Supply secrets privately through your development environment, never Git. Production and live-key configurations are refused. The App requires a local API and the API permits only a local database in this mode. No financial-provider credentials or mainnet activation are permitted.

In a Clerk DEVELOPMENT instance, enable email address sign-up/sign-in with email codes, verified email, Google, Apple, and MetaMask. Do not require organization creation, password, names, or phone at identity registration: the personal onboarding flow owns profile collection. Keep bot protection enabled; custom registration includes the clerk-captcha target. Set allowed local/Codespace frontend origins exactly; never use wildcard origins. Google/Apple activation and mobile wallet support depend on the provider's instance configuration and browser wallet capabilities. Initial verification codes are sent by Clerk; Resend remains a separate branded transactional-email boundary.

Development SQL is intentionally at supabase/development/clerk-auth.sql, outside the migrations directory. It requires an explicit disposable-database acknowledgement. It builds on the repository's current identity/profile schema, not a schema inferred from an old project. It is exercised against a disposable PGlite database with the REAL identity foundation migration and current privilege model. Do not apply it to production or a connected remote project. A fresh complete Supabase deployment schema and production migration plan remain separate review work.

## Implemented flows

- Custom Neptlium email-code sign-up and sign-in, resend cooldown, email correction, OTP verification and authenticator second factor. Provider errors stay normalized; incomplete verification does not activate a usable account.
- Google/Apple redirect sign-in and sign-up with callback handling. Missing registration email is completed in the custom flow; active wallet-only sessions must add and verify a primary email before API access.
- MetaMask registration/sign-in through Clerk's wallet strategy. Signed-in users can link a wallet in Security settings; Clerk verifies ownership and uniqueness. No recovery phrases, private keys, transactions, treasury destinations, custody keys or financial permissions are requested.
- Completion calls an explicit API bootstrap command using a bearer token, not browser-supplied IDs or email. The API verifies RSA/JWT signature, expiry, exact issuer and authorized party, checks the live session and current user, then requires a verified primary email. Revoked sessions, locked/banned users, unavailable identity infrastructure, missing maps and ambiguous maps fail closed.
- Stable principal creation is transactional and idempotent. A verified email collision is refused for ALL existing accounts, including suspended accounts. Email equality never silently links accounts. A normalized-email unique index also prevents concurrent duplicate profile writes outside the bootstrap command. Linking an existing Neptlium principal requires a future reviewed proof-of-control flow.
- Personal onboarding is service-only and one-time. Row locking and append-only acceptance evidence prevent repeat setup from modifying profile or account standing. It never creates an organization or grants financial capabilities. Profile browser writes remain revoked.
- Return destinations use the existing allowlist. The proxy overwrites the private return header. Session tokens are obtained server-side and never persisted in browser storage. Sign-out supports this device, other devices and all devices. Passwordless recovery uses verified email/social methods, never a Supabase password form in the Clerk path.

## Validation and limits

See the branch delivery report for actual commands/results. The API tests use real generated RSA keypairs and tokens, not a signature-validation stub. Database tests execute the SQL, including browser denial, duplicate-email protection, restricted standing, one-time onboarding and audit immutability. Local source checks do not prove email delivery, OAuth provider activation, a real wallet signature, or a configured Clerk development instance. Those require actual test credentials and user-controlled provider/wallet interactions.

The complete Supabase migration chain and a newly provisioned Supabase project are not created or applied by this branch. Production deployment, DNS, environment variables, credential migration, production database changes, merging and main-branch integration are explicitly outside authorization.

## References

- https://clerk.com/docs/guides/development/custom-flows/authentication/legacy/email-sms-otp
- https://clerk.com/docs/reference/backend/verify-token
- https://clerk.com/docs/react-router/reference/types/web3-wallet

## Validation record — 2026-10-22

| Check                                                                | Result  | Scope                                                                                                                                                           |
| -------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm --filter @neptlium/api test                                     | PASS    | 286 tests, including real RSA JWT verification, disposable database permissions, duplicate-email refusal, onboarding idempotency and legacy-provisioning denial |
| pnpm --filter @neptlium/app test                                     | PASS    | 202 tests, including executed email-code handlers, expired/incomplete verification, social return context and wallet strategy/linking behavior                  |
| API/App lint and typecheck                                           | PASS    | Codespace terminal                                                                                                                                              |
| App default production-mode build                                    | PASS    | Local compilation only; no deployment                                                                                                                           |
| App Clerk development configuration build                            | PASS    | Nonfunctional fixture keys; compilation only, no claim of live authentication                                                                                   |
| Actual Clerk email delivery, Google/Apple OAuth and wallet signature | BLOCKED | Genuine Clerk development keys were not available in the inspected environment sources                                                                          |
| Full local Supabase integration                                      | BLOCKED | Local Supabase project configuration was not available; SQL was executed in disposable PGlite tests                                                             |

Repository baseline: origin/main at 8aa8a2e3. The original Codespace main worktree was clean and 31 commits behind; its main branch was preserved. Two stale release/controlled-integration worktree registrations were preserved. Existing open PRs #134, #137, #139 and #140 were inspected and left unchanged. PR #139 includes a separate production onboarding-standing migration; this development SQL is outside the migration runner and does not supersede that work.

## Integration checkpoint — 2026-10-22

CURRENT: PR #142 remains development-only. The existing implementation at be60f397fd4e34c6a33fc8614d2c330741dec11e was inspected and preserved. No replacement Clerk application or authentication implementation was created.

### Audit and reproducible validation

The Codespace was inspected at /workspaces/neptlium on feat/clerk-custom-auth-development. Its working tree was clean before this follow-up. Existing local branches and the two prunable release worktree registrations were preserved. Current origin/main was 8aa8a2e357c10487c8a9da8f9a8535a67e94c364. Open PRs #134, #137, #139, #140 and #142 were inspected; no marketing or financial-control branch was changed. Root instructions, documentation router, this runbook, both environment templates, providers, middleware, API verification, custom routes, onboarding SQL and database tests were reviewed.

| Check                                         | Result  | Evidence and limits                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing implementation audit                 | PASS    | Existing development guards, immutable principal mapping, verified primary email enforcement, service-only onboarding and safe returns inspected; live correctness remains separately gated.                                                                                                                                             |
| API tests                                     | PASS    | Fresh Codespace run: 286 tests, 286 passed, zero failed/skipped. Includes generated RSA JWT verification and disposable PGlite SQL tests.                                                                                                                                                                                                |
| App tests                                     | PASS    | Fresh Codespace run: 202 tests, 202 passed, zero failed/skipped. SDK resources are mocked in custom-flow handler tests.                                                                                                                                                                                                                  |
| API/App lint                                  | PASS    | pnpm --filter @neptlium/api lint; pnpm --filter @neptlium/app lint.                                                                                                                                                                                                                                                                      |
| API/App TypeScript                            | PASS    | pnpm --filter @neptlium/api typecheck; pnpm --filter @neptlium/app typecheck.                                                                                                                                                                                                                                                            |
| API artifact build                            | PASS    | pnpm --filter @neptlium/api vercel-build; local runtime bundle emitted.                                                                                                                                                                                                                                                                  |
| App default build                             | PASS    | pnpm --filter @neptlium/app build; static generation completed for all 54 pages and final route table emitted. This was the default provider configuration, not a live Clerk test.                                                                                                                                                       |
| SDK compatibility                             | PASS    | Installed @clerk/nextjs 7.9.19, Next 16.2.10 and React 19.2.7 satisfy the package peer ranges; @clerk/backend remains 3.26.1. The documented /legacy hooks are supported in Core 3.                                                                                                                                                      |
| CLI diagnostics                               | BLOCKED | clerk doctor --json executed from apps/app. Authentication and project-link checks failed because no CLI account/token/link exists; application and instance reachability were skipped. No auto-fix was used.                                                                                                                            |
| Existing Clerk application linkage            | BLOCKED | clerk whoami --json returned auth_required. app_3L3YB2vvAvauk0qThnqx6SSCpaX has not been independently verified through authenticated CLI access.                                                                                                                                                                                        |
| Secure live development configuration         | BLOCKED | No Clerk keys in the inspected process or App/API private environment files; no local .clerk/config.json. No keys were pulled, overwritten or committed.                                                                                                                                                                                 |
| Local Supabase migration chain                | BLOCKED | Docker 29.8.0-1 and Supabase CLI 2.121.0 were available. An isolated /tmp/neptlium-clerk-local-validation workspace copied the tracked migrations. Two starts failed before application migrations, during internal Realtime schema initialization: DBConnection.ConnectionError, connection unavailable after approximately 15 seconds. |
| Clerk development SQL on full Supabase schema | BLOCKED | No healthy local stack was established, so the acknowledgement/application step was not executed. PGlite coverage passed but does not establish full-chain compatibility.                                                                                                                                                                |
| Real-provider App build/browser E2E           | BLOCKED | Genuine development credentials and a usable local database are still prerequisites.                                                                                                                                                                                                                                                     |

The Codespace restarted while reconnecting. Repository changes survived, but /tmp setup/log files did not. A final targeted local retry had disabled only the unused disposable Realtime service after the completed App build; its outcome could not be recovered and is NOT TESTED. Do not infer migration success from that attempt. Existing stopped audit/release PostgreSQL containers were left unchanged. Use a dedicated persistent development workspace for the next local-stack attempt and inspect Docker state before recreating anything.

### Genuine authentication acceptance matrix

Every provider result below remains BLOCKED until CLI authentication, genuine development keys and local database readiness are established. User-reported Dashboard toggles are not independent configuration verification.

| Area                        | Result     | Outstanding genuine checks                                                                                                                                                                                                                  |
| --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email                       | BLOCKED    | Registration, actual OTP delivery, valid/invalid/expired codes, resend cooldown, existing-user sign-in and incomplete registration recovery.                                                                                                |
| Google                      | BLOCKED    | Effective development settings, redirect initiation, callback, session creation, verified-email enforcement, safe returns and repeated sign-in.                                                                                             |
| Apple                       | BLOCKED    | Effective development credentials/redirect settings and the same OAuth/session checks. Development instances can use Clerk shared provider credentials; do not assume extra Apple credentials are required without inspecting the instance. |
| MetaMask                    | BLOCKED    | Connection, signature, registration/sign-in, linking, uniqueness refusal, wallet-only restrictions, verified-email completion and unlink support. No transaction, seed or private key is required.                                          |
| Session/security acceptance | BLOCKED    | Actual Clerk-issued JWT issuer/authorized party/expiration, revocation, sign-out, cross-account isolation, mapping failures and restricted users. Generated-token and backend-fixture checks passed in the API suite.                       |
| Onboarding acceptance       | BLOCKED    | Live bootstrap/principal stability, personal completion, one-time enforcement, restricted standing, immutable acceptance evidence and duplicate-email refusal. Disposable fixture SQL checks passed.                                        |
| Wallet unlink UI            | NOT TESTED | Existing linking UI does not implement unlinking; inspect provider support before any additional development change.                                                                                                                        |
| Effective provider policy   | BLOCKED    | Confirm email-code-only registration/sign-in, no required password/name/phone/organization, bot protection, exact frontend origins, redirects and enabled social/wallet strategies through the actual development instance.                 |

### Development fix and credential continuation

The App development script binds port 3001. The API template incorrectly authorized port 3000; both CLERK_AUTHORIZED_PARTIES and API_ALLOWED_ORIGINS now default to http://localhost:3001. Set the actual Codespace HTTPS frontend origin exactly when testing through a forwarded port, with no wildcard. NEPTLIUM_API_URL must remain the loopback API URL used by the App server.

In the Codespace terminal, the owner must complete npx -y clerk@latest auth login. Dashboard login does not authenticate this CLI. Then verify whoami, link the existing application with npx -y clerk@latest link --app app_3L3YB2vvAvauk0qThnqx6SSCpaX, and inspect the linked development instance. Never run clerk init or create another app.

The installed CLI help supports env pull --app <id> --instance <id> --file <path>. Pull only development keys into a fresh private file after checking existing values; do not overwrite unrelated environment variables. Verify pk_test_/sk_test_ prefixes without displaying values, obtain the exact issuer/JWT verification public key, and distribute only browser-safe values to NEXT_PUBLIC variables. Keep private files ignored and permission-restricted. Never paste credentials or OTPs into chat. User interaction remains necessary for actual email verification and provider/wallet approval.

### Read-only proposal for the new remote development project

TARGET ONLY, pending separate approval: udghxwlhztwxvkjaefjh, Neptlium, us-east-2, PostgreSQL 17.11.0.003. Connected read-only inspection returned ACTIVE_HEALTHY, no public tables and no migration history. No remote schema, policy, user or application-data write was performed.

The security advisor reported public.rls_auto_enable() as SECURITY DEFINER and executable by both anon and authenticated. Review its purpose and execution grants before integration. Remediation references: [anonymous execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) and [authenticated execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). These are unresolved findings, not permission to change the remote database.

1. Establish repeatable full migration replay on disposable local Supabase/PostgreSQL 17; validate required extensions, schema, constraints, triggers, RLS, function grants and ownership against the entire chain.
2. Review the resulting schema and a separate forward integration plan, including the advisor findings, normalized-email uniqueness and immutable acceptance records. Do not rewrite historical migrations or copy old production users/data.
3. Review an explicit remote-development API environment boundary separately. The present CLERK_DEVELOPMENT local-only database guard must remain enforced; do not bypass it to target this project.
4. After separate approval, apply the reviewed schema plan to the verified new development project, then run actual API/database isolation and provider-backed browser acceptance with test-only accounts and financial execution disabled.
5. Consider production only through a later separately authorized cutover review. Current readiness is BLOCKED for controlled integration acceptance.

Marketing coordination: no apps/web pages, shared visual design, Claude branch/worktree or financial-control PR was edited. Any future marketing sign-in link update must be coordinated after the approved App entry origin is established.
