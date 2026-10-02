# Environment contract

Environment variables are configuration inputs, not capability or authority.

## Classification

| Name | Owner | Applications | Exposure | Phase | Requirement |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth | App, Treasury, Admin | Public | runtime | required for authenticated browser sessions |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Auth | App, Treasury, Admin | Public | runtime | required for authenticated browser sessions |
| `NEXT_PUBLIC_SITE_URL` | application | App, Treasury, Pay, Admin where declared | Public | build/runtime | production origin contract |
| `NEPTLIUM_API_URL` | platform | App, Treasury, Pay, Admin | Server configuration | runtime | API origin |
| `SUPABASE_URL` | platform | API | Server-only | runtime | durable Supabase endpoint |
| `SUPABASE_ANON_KEY` | Supabase compatibility/auth verification | API | Server configuration; public-class key but not browser API contract | runtime | currently consumed by API bearer verification |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase | API | Server configuration | runtime | declared compatibility/migration variable; verify consumer before removal |
| `SUPABASE_SERVICE_ROLE_KEY` | platform | API | **Server-only secret** | runtime | privileged persistence boundary |

The API example additionally declares: `NODE_ENV`, `API_HOST`, `API_PORT`, `API_LOG_LEVEL`, `API_BUILD_ID`, `API_ALLOWED_ORIGINS`, `APP_ORIGIN`, `API_ORIGIN`, `ENABLE_MAINNET`, `ALCHEMY_API_KEY`, `ALCHEMY_ENVIRONMENT`, `ALCHEMY_RPC_URL`, `ALCHEMY_WEBHOOK_SIGNING_KEY`, `ALCHEMY_PRODUCTION_CAPABILITY_VERIFIED`, `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_ENVIRONMENT`, `CIRCLE_WALLET_SET_ID`, `CIRCLE_LIVE_CAPABILITY_VERIFIED`, `CIRCLE_LIVE_EXECUTION_ENABLED`, `ENABLE_WALLET_PROVISIONING`, `ENABLE_CRYPTO_DEPOSITS`, `ENABLE_CRYPTO_WITHDRAWALS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `WEBHOOK_TOLERANCE_SECONDS`.

Provider keys, entity secrets and webhook signing material are server-only secrets. Environment/capability booleans are server-only gates. Origins, ports, logging and build identifiers are server runtime/build configuration. Presence never proves a live capability.

## Supabase naming

Browser applications have converged on `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The API still consumes `SUPABASE_ANON_KEY` for server-side Supabase Auth token verification and also declares `SUPABASE_PUBLISHABLE_KEY`. Do not rename or remove either API variable until runtime consumers and deployed Vercel scopes are migrated deliberately.

## Rules

Never commit values for secrets. Never expose service-role, provider secret, webhook signing, wallet signing, or private-key material through `NEXT_PUBLIC_*`. Production, preview, and development scopes must be isolated. Feature gates and provider credentials are not interchangeable: credentials do not activate capability.


## Deployment environment versus provider financial environment

Neptlium deployment environment and provider financial environment are separate dimensions.

```text
Preview deployment != Provider TEST
Production deployment != Provider LIVE authority
TEST capability != LIVE capability
```

Development, preview and production describe Neptlium runtime/deployment context. Provider TEST/sandbox/testnet and LIVE/mainnet describe an external provider's financial environment. A production deployment MAY operate only against a reviewed TEST capability; conversely, deploying production code never authorizes LIVE provider operations.

**TARGET invariant:** where financially material, provider environment identity MUST be preserved independently in capability declarations, intents, evidence, provider references, reconciliation and audit, and environment crossing MUST fail closed. **TRANSITION:** not every existing path satisfies this yet; for example, current Admin treasury-destination context derives provider environment from `NODE_ENV`. Until those paths are migrated in a focused runtime change, deployment environment MUST NOT be treated as proof of provider TEST/LIVE authority.

## Credential and signing authority

Ordinary provider API credentials, entity secrets and webhook-verification material remain server-only and require least-privilege scope, controlled storage, rotation, revocation and audit appropriate to their authority.

Execution signing is a separate security boundary and MUST NOT be treated as an ordinary API-key configuration problem. Before any provider LIVE execution is certified, its signing architecture requires explicit review of:

- key ownership and authority;
- isolated signing boundary;
- operation authorization binding;
- key scope;
- TEST/LIVE isolation;
- rotation and revocation;
- audit evidence;
- KMS/HSM or equivalent custody controls appropriate to the threat model.

Deployment-platform environment variables are configuration delivery; their presence MUST NOT be described as institutional execution-signing custody without a separately reviewed signing architecture.

The following are prohibited:

- customer seed phrases as an integration model;
- customer primary-wallet private keys held for provider integration;
- signing credentials or provider secrets in browser JavaScript;
- secrets in `NEXT_PUBLIC_*`;
- secrets in API responses;
- secrets in logs;
- secrets committed to Git or public build output.

Credential presence proves configuration only. It does not prove provider reachability, capability, certification, customer eligibility, authorization, execution, reconciliation or canonical financial state.
