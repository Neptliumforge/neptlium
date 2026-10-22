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
