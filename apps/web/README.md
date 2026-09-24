# @neptlium/web

Public marketing and information website for `neptlium.com`.

`apps/web` represents one Neptlium company with two product journeys: **Personal / Neptlium Capital** and **Business / Neptlium Treasury**. It owns public positioning, product storytelling, editorial authority, SEO, trust architecture and acquisition. It owns no authenticated customer session, privileged financial operation, canonical financial state, custody, execution or settlement authority.

## Marketing authority

The authoritative marketing specification is [`docs/experience/DESIGN_SYSTEM.md`](../../docs/experience/DESIGN_SYSTEM.md). It supersedes prior PR #68 and Personal-first Stage 01 marketing assumptions.

Canonical top-level navigation:

- Personal → `/personal`
- Business → `/business`
- Platform → `/platform`
- Insights → `/insights`
- Security → `/security`
- Company → `/company`

Canonical product-story routes include `/investments`, `/capital`, `/portfolio`, `/allocation` and `/treasury`.

## Product destinations

- Personal / Neptlium Capital → `https://app.neptlium.com`
- Business / Neptlium Treasury → `https://treasury.neptlium.com`
- Payments → `https://pay.neptlium.com`
- API → `https://api.neptlium.com`
- Docs → `https://docs.neptlium.com`
- Admin → `https://admin.neptlium.com`
- Status → `https://status.neptlium.com`

Do not send business users through the investor login. Do not represent Neptlium Treasury as the entire Neptlium company.

## Financial truth

Marketing must not fabricate customers, balances, AUM, returns, performance, transaction history, payment history, opportunity inventory, execution, settlement, custody, provider relationships, licences, regulatory status or partnerships.

`UNKNOWN != ZERO`. Configured is not live. Provider evidence is not canonical state. Modeled is not executed. Submitted is not settled. Settled is not reconciled.

## Visual system

Marketing is black-first, cinematic, product-first, editorial and financially credible. Personal and Business share one design system. Current implementation authority:

- `app/marketing-system.css`
- `app/unified-shell.css`
- `app/unified-marketing.module.css`
- `components/unified-product-visuals.tsx`
- `components/site-header.tsx`
- `components/mobile-navigation.tsx`
- `components/site-footer.tsx`
- `components/global-conversion-cta.tsx`

## Validation

```sh
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Use GitHub-hosted Ubuntu for Playwright. Validate at 1440, 1280, 768, 390 and 360 CSS pixels.
