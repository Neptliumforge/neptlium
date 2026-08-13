# Neptlium Marketing Design Doctrine

**Status:** Authoritative  
**Primary implementation:** `apps/web` → `https://neptlium.com`  
**Doctrine:** Dark-First Institutional Capital Infrastructure

This document is the marketing design authority for `apps/web`. It supersedes the previous Premium White / Cobalt / Crystalline marketing direction. `docs/03_DESIGN_SYSTEM.md` continues to govern shared/product typography, accessibility, operational restraint and the authenticated product. This doctrine must not be used to recolor or restyle `apps/app`, `apps/admin` or `apps/api`.

## Scope

Marketing is atmospheric, architectural, narrative and high-authority. The authenticated product is operational, restrained, information-first and governed. The public website explains the capital operating system; it never impersonates the product dashboard and never carries privileged financial authority.

The homepage remains exactly six major compositions:

1. Navigation + Hero
2. Capital Operating Thesis
3. Product Operating System
4. Treasury · Allocation · Connectivity
5. Governance + Technical Foundation
6. Conversion + Footer

## Canonical hero

Eyebrow: **DIGITAL CAPITAL OPERATING INFRASTRUCTURE**

Headline: **Capital, organized around you.**

Supporting copy: **Neptlium brings digital assets, capital policy, portfolio visibility, treasury structure and connectivity into one controlled operating environment.**

Primary CTA: **Enter the App**  
Secondary CTA: **Explore Neptlium**

The hero headline is static. No typewriter effect. The hero system visual communicates:

**CAPITAL → STRUCTURE → POLICY → CONTROL → OPERATION**

through quiet structural planes, thin lines and sparse precision-blue signals. No token logos, fake dashboards, fake balances, candlesticks, crypto imagery, neon or glowing geometry.

## Marketing-local semantic tokens

The public marketing layer owns the following semantic aliases under `apps/web` only:

```css
--marketing-black: #000000;
--marketing-obsidian: #05060B;
--marketing-depth-1: #050B15;
--marketing-depth-2: #0A111F;
--marketing-depth-3: #0C1324;
--marketing-depth-4: #0D162A;
--marketing-depth-5: #151F3D;
--marketing-blue: #258BE5;
--marketing-blue-hover: #319EED;
--marketing-text-primary: #F8F9FC;
--marketing-text-secondary: #E7EAF0;
--marketing-text-tertiary: #B7BBC6;
--marketing-text-muted: #9297A4;
```

Do not replace `packages/ui/src/styles/brand.css` with this palette. Shared operational tokens remain independent.

## Color governance

Target visual balance is roughly 55–65% black/near-black, 15–20% midnight structural depth, 8–12% cool white/gray typography and 5–8% precision blue. Cyan and violet are minimal; decorative green is excluded.

`#258BE5` is the primary interaction signal for primary CTAs, selected navigation, meaningful links, focus and small system cues. `#319EED` is the hover/focus elevation. Blue must not become a section fill, giant card color, universal border treatment or atmospheric wash.

## Composition rules

### Capital Operating Thesis

Explain fragmented surfaces flowing into one governed operating layer. Wallets, exchanges, custody, networks and treasury systems are source surfaces. Neptlium is the operating layer. Portfolio, Treasury, Policy, Allocation, Authorization and Operational record are governed outputs. Avoid eight equal cards.

### Product Operating System

Overview is dominant. Portfolio supports interpretation. Capital Account is the operational boundary. Render them as one connected system, never three equal feature cards. Never invent balances, returns, holdings or P&L.

### Treasury · Allocation · Connectivity

This is the deepest technical section. Treasury represents liquidity and operating capacity. Allocation represents policy, modeling and authorization. Connectivity represents the infrastructure layer beneath operation. Do not imply execution merely because a plan is authorized.

### Governance

Use the architectural sequence:

**Authorization → Ledger → Reconciliation**

Governance is embedded in the architecture. No badges, fake certifications, partner walls or compliance seals.

### Conversion + Footer

Closing expression: **Capital, made operational.**

Primary CTA: **Enter the App**. The footer is corporate closure organized around Brand, Legal, Corporate and Social. Only configured destinations may appear. Do not duplicate authenticated product navigation.

## Typography

Typography carries the design. Use the best already-available licensed geometric/system stack. Do not fetch Google Fonts remotely and do not add unnecessary font binaries. Display scale should be large, calm and tightly tracked; body text remains highly readable and restrained.

## Navigation

Desktop navigation remains Platform, Capital, Connectivity, Governance and Company. Mobile keeps the full-screen accordion architecture, one open section at a time, body-scroll lock, Escape close, focus trap, focus restoration and 44px minimum targets. The mobile environment is primarily `#05060B`.

## Theme

The public marketing site is dark-first and must not force a light-only root theme. Theme metadata, browser chrome and SSR output should reflect the dark authority surface without hydration flash. A future light mode must be intentionally designed, not obtained by color inversion.

## Motion

Use 160–220ms for interface motion, 180–280ms for disclosure and 320–600ms for editorial reveal. Scrolling stays native. No scroll hijacking, constant parallax, floating-card loops, pulsing backgrounds or large glow animation. Respect `prefers-reduced-motion`.

## Accessibility and performance

Preserve semantic landmarks, one meaningful H1, logical heading order, keyboard navigation, visible focus, touch targets, sufficient contrast and meaningful links. Decorative architecture is hidden from assistive technology where appropriate. Prefer CSS and lightweight static structure; avoid large video, excessive blur and heavy animation libraries.

Responsive verification targets are 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1600+ pixels.

## SEO and truthfulness

Preserve title, description, canonical metadata, Open Graph, Twitter metadata, structured data, sitemap, robots and favicon infrastructure. Never fabricate customers, assets under management, volume, uptime, offices, providers, certifications, regulation, custody, settlement, balances, returns or live financial capability.

Marketing may demonstrate architecture. It must never manufacture evidence.
