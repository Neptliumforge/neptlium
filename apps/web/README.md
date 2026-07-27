# Neptlium Web

The public marketing and product-information website for **Neptlium**.

Neptlium is capital operating infrastructure for modern ownership. The website introduces the platform, its operating model, planned capital universe, security boundaries, research direction, and access pathways without fabricating product readiness or financial activity.

## Production domains

| Environment | Domain |
|---|---|
| Primary website | https://neptlium.com |
| Canonical www domain | https://www.neptlium.com |
| Authenticated platform | https://app.neptlium.com |

The Vercel project root directory for this application is:

```text
apps/web
```

## Application status

This application is integrated into the Neptlium pnpm and Turborepo monorepo.

The marketing website is under active development. Custody, blockchain-provider connectivity, allocation authorization, transaction execution, pricing, regulatory approval, and production asset availability must not be inferred from marketing content.

## Routes

| Route | Purpose |
|---|---|
| `/` | Primary product narrative |
| `/platform` | Platform operating environment |
| `/capital-universe` | Planned provider-dependent assets |
| `/security` | Security principles and infrastructure boundaries |
| `/research` | Research and product-thinking direction |
| `/about` | Company and product purpose |
| `/contact` | Contact and support access |
| `/privacy` | Privacy draft |
| `/terms` | Terms draft |
| `/cookie-policy` | Cookie-policy draft |
| `/accessibility` | Accessibility statement |
| `/risk-disclosure` | Risk disclosure draft |
| `/pricing` | Unindexed access-and-availability information |

Legal documents are structured drafts and require qualified legal review before production reliance.

## Brand assets

The canonical Neptlium mark is implemented at:

```text
apps/web/public/icon.svg
```

The mark is used for application metadata, favicon presentation, organization structured data, and reusable brand identity components.

Do not replace it with alternate or unrelated visual assets.

## Experience architecture

The homepage includes:

- a procedural, motion-aware hero;
- the Neptlium operating environment;
- Observe, Model, and Authorize allocation states;
- planned provider-dependent asset support;
- security and controlled-operation principles;
- truthful product-state previews;
- a restrained access call to action.

The site intentionally avoids fabricated balances, returns, customers, transaction activity, certifications, partnerships, pricing, and production-custody claims.

## Motion and accessibility

Motion uses lightweight CSS, SVG, and browser APIs rather than large animation dependencies.

The application supports:

- reduced-motion preferences;
- keyboard-visible focus;
- semantic landmarks;
- skip navigation;
- accessible desktop navigation;
- an accessible mobile drawer;
- Escape and outside-press closing;
- focus trapping and restoration;
- scroll locking;
- safe-area handling;
- responsive layouts without horizontal overflow.

## Local development

From the repository root:

```bash
pnpm install
pnpm --filter @neptlium/web dev
```

The local application is normally available at:

```text
http://localhost:3000
```

## Verification

Run from the repository root:

```bash
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web build
```

TypeScript and ESLint are expected to run in Termux.

The Next.js production build may fail on Android ARM64 when a compatible SWC binary or WASM fallback is unavailable. Final production builds must therefore be verified through GitHub Actions, Vercel, or another supported Linux environment.

## Environment configuration

The public website currently does not require custody-provider or blockchain-provider credentials.

Browser-safe variables, when needed, must use explicit `NEXT_PUBLIC_` names. Server-only secrets must never be exposed through browser variables or committed to the repository.

Potential server infrastructure variables belong to future backend services, not the marketing client:

```text
SUPABASE_SERVICE_ROLE_KEY
CDP_API_KEY_ID
CDP_API_KEY_SECRET
CDP_WALLET_SECRET
ALCHEMY_API_KEY
ALCHEMY_RPC_URL
ALCHEMY_WEBHOOK_SIGNING_KEY
```

The absence of those credentials does not block marketing-site development or deployment.

## Deployment

Create a dedicated Vercel project with:

| Setting | Value |
|---|---|
| Project name | `neptlium-web` |
| Root directory | `apps/web` |
| Framework | Next.js |
| Production domain | `neptlium.com` |
| Additional domain | `www.neptlium.com` |

The authenticated platform must remain a separate Vercel project rooted at `apps/app`.

## Content constraints

The website must not advertise:

- funding methods outside the documented provider-dependent digital-asset scope;
- production custody before provider confirmation;
- supported assets before provider confirmation;
- investment returns or performance;
- invented pricing or allocation minimums;
- regulatory approval or security certification;
- fabricated users, customers, partners, or testimonials.

Planned asset references are limited to:

- USDC on Base;
- ETH on Base;
- BTC on Bitcoin.

All planned assets remain provider-dependent until production integration is confirmed.

## Support

```text
support@neptlium.com
```
