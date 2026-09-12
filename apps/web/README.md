# @neptlium/web

Public product and company website for `neptlium.com`.

> **Production remediation mode:** Web may explain NEPTLIUM's intended product model, but it must not imply that unproven financial capability is live.

## Authority

`apps/web` owns public narrative, product explanation, SEO, discoverability, and entry into the authenticated application. It owns no authenticated customer session, privileged financial action, provider secret, canonical balance, settlement state, or reconciliation authority.

## Current communication contract

Public copy may describe the platform's intended capital operating model strongly, but factual claims about the following require evidence:

- live deposits or withdrawals;
- settlement or reconciliation;
- custody/provider relationships;
- customers, AUM, transaction volume, performance, or returns;
- licences, regulatory status, approvals, partnerships, or live availability.

The site should not expose internal remediation mechanics as ordinary marketing content, but it also must not direct users into a real-money capability that remains closed by the production execution ledger.

## Product architecture

Canonical top-level areas remain Platform, Products, Solutions, Resources, and Company. Public route/navigation authority remains in the Web content architecture. Visual/editorial work must remain consistent with `docs/03_DESIGN_SYSTEM.md` and `docs/04_WEB_MARKETING_SYSTEM.md`.

## Environment

Ordinary public rendering should not require privileged credentials. Only intentionally browser-safe values may use `NEXT_PUBLIC_*`.

## Commands

```sh
pnpm --filter @neptlium/web dev
pnpm --filter @neptlium/web typecheck
pnpm --filter @neptlium/web lint
pnpm --filter @neptlium/web test
pnpm --filter @neptlium/web build
```

Product constitution: [`docs/00_PRODUCT_CONSTITUTION.md`](../../docs/00_PRODUCT_CONSTITUTION.md)  
Web system: [`docs/04_WEB_MARKETING_SYSTEM.md`](../../docs/04_WEB_MARKETING_SYSTEM.md)  
Execution ledger: [`docs/15_PRODUCTION_READINESS_AUDIT.md`](../../docs/15_PRODUCTION_READINESS_AUDIT.md)
