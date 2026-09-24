# Asset authority

Audit date: 2026-09-24.

## Runtime canonical

`packages/ui/src/shell/NeptliumMark.tsx` is the canonical runtime mark geometry. Web, App, Admin, Treasury and shared shells consume or re-export this component rather than maintaining competing SVG geometry.

## Required public/distribution assets

- `apps/web/public/icon.svg` — Web favicon/icon format using the canonical three-stroke geometry in brand teal.
- `apps/app/public/icon.svg` — App favicon/icon format using the same geometry with an application background/tone.
- `apps/web/public/marketing/{overview,capital-account,allocation,company-intelligence,treasury}.webp` — marketing imagery consumed by the public experience.

The two SVG icons intentionally share geometry but differ in presentation/background; they are legitimate public-format variants, not independent mark authorities.

No `assets/brand` directory is introduced because the audited reference/distribution set is small and already has runtime/framework consumers. Moving it would add indirection without eliminating an authority conflict.

## Rule

New mark geometry belongs in the shared UI authority first. Framework-required public files may duplicate the geometry only as generated/controlled distribution variants. Do not introduce `logo-final`, `logo-new`, `logo-v2`, or application-local production marks.
