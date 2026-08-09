# NEPTLIUM

## Institutional Capital Operating System

### Design System & Experience Directive (Authoritative Specification)

This specification governs every authenticated experience inside Neptlium.

Its purpose is not to create an attractive fintech application.

Its purpose is to create the perceived experience of institutional financial infrastructure.

The emotional response of every user should be:

> "I have been granted access to professional capital infrastructure."

Never:

> "I signed up for another finance application."

---

# EXPERIENCE PRINCIPLES

Every interface decision must reinforce five pillars.

• Institutional Trust

• Security

• Precision

• Stability

• Long-Term Capital Stewardship

Every screen should reduce cognitive noise.

Every interaction should communicate confidence.

Every animation should have purpose.

Nothing should feel playful.

Nothing should feel promotional.

Nothing should feel consumer-oriented.

---

# VISUAL LANGUAGE

Do not imitate fintech startups.

Do not imitate cryptocurrency exchanges.

Do not imitate productivity software.

Instead, combine characteristics from:

• Bloomberg Terminal

• BlackRock Aladdin

• Fireblocks

• Fidelity Institutional

• Goldman Sachs Marquee

• Apple Human Interface Guidelines

• Modern private banking portals

The result should feel timeless rather than trendy.

---

# DESIGN CHARACTER

The interface should feel engineered.

Not designed.

It should resemble software used to operate billions of dollars.

Not software trying to impress users.

Confidence comes from restraint.

---

# COLOR SYSTEM

Institutional midnight navy, not true black — true black reads as consumer
OLED/crypto-exchange; deep navy-charcoal is what Bloomberg, Aladdin, and
enterprise trading terminals actually use, and it holds up better across long
analysis sessions and against data visualization. Applied uniformly across
the entire product — gateway, auth, onboarding, dashboard, portfolio, wallet,
reports, research, settings. There is no separate "auth-only" palette.

**Surfaces**

| Layer | Hex | Use |
|---|---|---|
| Canvas — Institutional Midnight Navy | `#07111F` | App background, sidebar, top nav |
| Surface 1 — Graphite Navy | `#0E1728` | Primary cards, widgets, forms, tables |
| Surface 2 — Steel Blue Slate | `#162235` | Hover cards, dropdowns, menus |
| Surface 3 — Slate Elevation | `#1E2D44` | Modals, popovers, command palette, notifications |

**Borders**

| Role | Hex |
|---|---|
| Divider (section separation, table/nav dividers) | `#182437` |
| Soft (standard cards, tables, inputs) | `#233248` |
| Strong (selected cards, focused controls) | `#35506F` |

**Primary accent — Institutional Emerald** `#1EC98E`. The one accent used
product-wide: primary buttons, active navigation, selected tabs, radio/
checkbox/toggle, focus rings, progress, confirmations. Never on anything
that isn't actionable or confirming state.

**Secondary accent — Executive Gold** `#C9A14A`. Used sparingly: premium/
verified/certified indicators, VIP status, high-value metrics. Never on
buttons.

**Status** (base hue; translucent backgrounds derive from it, not a separate
literal background token): Success `#23C77A` · Warning `#E5B84C` · Danger
`#E05454` · Information `#3F88F6`.

**Text hierarchy**: Primary `#F5F8FC` · Secondary `#C7D2E0` · Tertiary
(metadata, dates, hints) `#93A2B7` · Disabled `#5B687A`.

**Charts**: Positive `#23C77A` · Negative `#E05454` · Neutral `#6E7C92` ·
Projected `#3D8BFF` · Historical average `#8A7CF6`. Allocation distribution
cycles Emerald → Sapphire → Gold → Violet → Slate.

Use borders instead of shadows wherever possible. Shadows only where depth is
structurally necessary (floating cards, dialogs).

---

# TYPOGRAPHY

Typography communicates authority. Generous whitespace; never crowd
information. Numbers must be visually stronger than labels — portfolio
values dominate, supporting descriptions recede.

| Token | Size | Use |
|---|---|---|
| Display | 72px | Gateway, major onboarding titles, portfolio total value only |
| Hero | 44px | Gateway's single composed headline (the one non-standard-page screen) |
| H1 | 48px | Application pages |
| H2 | 40px | Dashboard sections |
| H3 | 32px | Cards |
| H4 | 24px | Section titles |
| H5 | 20px | Widget titles |
| Body Large | 18px | |
| Body | 16px | |
| Small | 14px | Card descriptions, hints, table cells (this is `text-body-sm`) |
| Caption | 12px | |
| Label | 13px, medium weight | Form field labels specifically — distinct from Small |

**Font pairing**: Inter (primary), IBM Plex Mono (secondary). Mono is used
only for balances, wallet addresses/references, transaction IDs, hashes, and
performance figures — never for prose.

**Weights**: Regular 400, Medium 500, Semibold 600, Bold 700. Never 800/900.

---

# SPACING

Everything breathes. Nothing feels compressed. Crowded interfaces communicate
consumer software. Neptlium uses Tailwind's default 4px-based spacing scale
directly (space-1=4px through space-24=96px) — no custom override; the
default scale already is the approved scale.

---

# RADIUS

Large rounded corners read as consumer software. Restrained radii only —
never exceed 16px.

| Token | Size | Use |
|---|---|---|
| none | 0px | Charts, tables |
| xs | 4px | Inputs |
| sm | 6px | Buttons, nav items |
| md | 8px | Cards |
| lg | 12px | Dialogs |
| xl | 16px | Hero panels |
| pill | 999px | Status badges |

---

# COMPONENT PHILOSOPHY

Large surfaces.

Large spacing.

Low visual noise.

Rounded corners should be subtle (see Radius, above).

Avoid excessive gradients.

Avoid glowing effects.

Avoid glassmorphism.

Avoid neumorphism.

Avoid excessive animations.

---

# ELEVATION

Six levels, 0 through 5. Shadows are extremely subtle — never an oversized
soft shadow.

| Level | Use |
|---|---|
| 0 | Application background |
| 1 | Cards |
| 2 | Hover cards |
| 3 | Dialogs |
| 4 | Command palette |
| 5 | Critical modal |

---

# MOTION

Motion should communicate state, not excitement.

| Token | Duration |
|---|---|
| Fast | 120ms |
| Normal | 180ms |
| Slow | 250ms |

Easing: ease-out or ease-in-out. No bounce, no elastic, no overshoot.

Allowed: fade, slide, scale, opacity, progress, number transitions, loading
shimmer.

Forbidden: bounce, spin (except loaders), floating, jelly, rubber band.

---

# LANGUAGE

Never use marketing language inside the application.

Instead of:

Amazing

Powerful

Revolutionary

Use:

Secure

Verified

Operational

Available

Protected

Connected

Provisioned

Institutional

Never casual. Instead of "Awesome!" — "Operation completed successfully."
Instead of "Oops!" — "An unexpected error occurred." Instead of "You're all
set!" — "Your Neptlium Account is ready." Everything should read as though it
belongs in an institutional financial platform.

---

# APPLICATION ENTRY

The first screen should feel like entering secure infrastructure.

Not arriving at a landing page.

Large centered composition.

Extremely quiet.

Minimal movement.

No illustrations.

No marketing graphics.

No stock photography.

Only typography.

Institutional status.

Actions.

---

# AUTHENTICATION

Authentication is account access.

Not login.

Never ask users to "Join".

Never ask users to "Get Started".

Instead:

Create Neptlium Account

Access Neptlium Account

Secure Authentication

Identity Verification

---

# ACCOUNT OPENING

Treat signup as institutional account establishment.

The user is opening an investment account.

Not registering.

Each step should feel procedural.

Identity

Purpose

Profile

Security

Compliance

Provisioning

Activation

Estimated completion should be stated up front: approximately 2 minutes.

---

# ACCOUNT PURPOSE

The Purpose step asks why this account exists. Options, each with a short
operational description rather than a bare label:

Individual Investor — personal capital, managed by one person.

Family Office — capital management for a single family's institutional needs.

Business — corporate treasury and operating capital.

Investment Firm — capital deployed on behalf of clients or funds.

Treasury Team — institutional cash and liquidity management.

Capital Partner — allocating alongside or into Neptlium-connected strategies.

The choice branches the Profile step below.

---

# PROFILE

An Individual Investor completes:

Primary Objective

Investment Experience

Preferred Currency

Risk Preference

Every other Purpose (Family Office, Business, Investment Firm, Treasury Team,
Capital Partner) completes an Organization Profile instead:

Company Name

Role (the account holder's role within the organization)

Website

Industry

Country

Organization Size

Assets Under Management (optional)

---

# SECURITY ACTIVATION

This screen communicates institutional security, not optional convenience —
the tone is "here is what protects your capital," never "here's a setting you
could enable."

Multi-Factor Authentication

Authenticator App

Recovery Codes

Trusted Device

Biometric Authentication (where the platform supports it)

---

# LEGAL & COMPLIANCE

Terms, Privacy, Risk Disclosure, AML, Electronic Consent — presented as a
single certification, not a wall of text. One acknowledgment, clearly worded,
with links out to the full documents.

---

# ACCOUNT PROVISIONING

This is the most important interaction.

Never use a spinner.

Never display generic loading.

Provision infrastructure.

Example progression:

Secure identity established.

Capital Account activated.

Portfolio initialized.

Security policies applied.

Compliance profile registered.

Institutional services connected.

Account ready.

Every step appears sequentially.

Each remains visible after completion.

The user should feel infrastructure is being prepared.

---

# WELCOME

The moment after provisioning completes, before the user enters the
platform. States plainly, without celebration:

Welcome to Neptlium.

Your institutional account is now active.

Your Capital Account has been securely provisioned.

Your investment portfolio has been initialized.

One action: Enter Platform.

---

# APPLICATION GATEWAY

The Application Gateway is not a splash screen, not a login page, not a hero
section. It is the transition between the public website and the
institutional operating system — the psychological handoff from "visitor" to
"authorized operator."

By the time a user reaches this screen they have already decided to use
Neptlium (they clicked Sign In / Create Account on the public site). This is
not the place to re-sell them. Trust must be established here, before any
credential is requested — not through feature promotion, but through the
appearance of operational readiness itself.

Explicitly excluded: marketing content, feature/capability lists, pricing,
testimonials, sales messaging, hero imagery, illustrations, stock photography.
If a design draft for this screen includes a bulleted list of product
capabilities, that draft is wrong — it reads as a landing page, which is the
one thing this screen must never be.

States, in order:

NEPTLIUM

Institutional Capital Operating System

Secure access to institutional-grade capital infrastructure.

A single infrastructure status indicator (e.g. "Infrastructure Operational").

Two actions: Create Neptlium Account (primary), Sign In (secondary).

Footer: three restrained status words, not a sentence — e.g. Encrypted,
Verified, Protected. A sentence reads as reassurance; three quiet words read
as fact.

Nothing else. The restraint is the trust signal.

---

# ACCOUNT CREATION FIELDS

First Name, Last Name, Email, Password, Confirm Password, Country.

The account being opened is a named institutional relationship, not an
anonymous login — collect enough identity up front that Purpose/Profile
feels like continuation, not repetition.

---

# PORTFOLIO

Never call it Dashboard.

Portfolio is the primary destination.

Users care about capital.

Not dashboards.

Portfolio always opens first.

---

# INFORMATION PRIORITY

Users should immediately see:

Portfolio Value

Today's Performance

Available Cash

Capital Account

Investments

Recent Activity

Everything else becomes secondary.

---

# NEPTLIUM WALLET

Capital Account is not a feature.

It is a core product.

The wallet represents institutional treasury.

It must feel equivalent to professional custody software.

Wallet contains:

Assets

Deposit Addresses

Transfers

Withdrawals

Funding

Statements

History

Network Status

Treasury Operations

---

# EMPTY STATES

Never show empty dashboards.

Instead show readiness.

Example:

Portfolio Ready

Wallet Active

Identity Verified

Security Enabled

Awaiting Initial Funding

The platform should always appear operational. Every empty state names the
purpose, the next step, and a primary action — never just blank space.
Example: "No portfolio allocations yet." / "Browse Opportunities" as the
primary action. If there is genuinely no real action to offer yet (no
backend behind it), state that plainly instead of inventing a button that
does nothing — see the Interaction Standard this codebase already follows.

---

# STATUS SYSTEM

Throughout the application show infrastructure confidence.

Examples:

Identity Verified

Wallet Active

Infrastructure Operational

Security Protected

Portfolio Ready

Compliance Active

These reinforce trust continuously.

---

# ICONOGRAPHY

Library: Lucide. Stroke width: 2px. Sizes: 16 / 20 / 24 / 32 (nearest
Tailwind step to the reference 16/18/20/24/32 scale — an exact 18px step
isn't native to the spacing scale and isn't worth a bespoke token). Never mix
icon styles. Icons support labels; they never replace labels.

---

# TABLES

Institutional software uses tables, not oversized cards, for: performance,
transactions, reports, statements, investments. Dense but readable.

Feature checklist: sticky header, column sorting, filtering, pagination,
bulk selection, CSV export, keyboard navigation, hover highlight. Not every
table needs every feature on day one — but a table that claims one of these
(a sort arrow, a filter control) must have it actually work. See Golden
Rule.

---

# GRID SYSTEM

Desktop: 12-column grid, max width 1600px, content width 1440px. Tablet:
8-column. Mobile: 4-column. Desktop-first design, tablet-optimized, mobile
simplified — no horizontal scrolling; navigation collapses intelligently.

Sidebar: 280px expanded, 88px collapsed. Top header: 72px. Content padding:
32px.

---

# NAVIGATION

Portfolio

Capital Account

Transactions

Treasury (operator and above)

Allocations (analyst and above)

Risk (manager and above)

Documents

Reports (analyst and above)

Research

Notifications

Settings — includes Security (MFA enrollment, session/device history,
sign-out-of-other-devices); not a separate top-level item, so the rail stays
short even as capability grows. No recovery codes — Supabase Auth doesn't
support them; enrolling a second factor is the supported recovery path.

Administration (admin and above) — visible only to roles that pass it

Every item's visibility is role-gated. A given user only ever sees what
their role permits — the rail should never advertise capability a viewer
cannot use.

Active item: emerald left indicator, emerald icon, surface highlight.
Inactive: muted text, transparent background. Hover: Graphite Navy (Surface
1).

Simple.

Predictable.

Stable.

---

# COMPONENT STATES

Every interactive component must define: default, hover, focused, pressed,
loading, success, warning, error, disabled, read-only, selected, expanded,
collapsed. Never implement only a default state — an interactive element
missing its loading/disabled/error state is exactly the "dead interaction"
problem this codebase treats as a defect, not a polish item.

---

# FORMS

Label → Input → Helper text → Validation, in that order top to bottom.
Never place validation above a field — errors appear directly below it.

---

# LOADING STATES

Skeletons and progress bars, incremental where possible. Never a bare
"Loading…" with nothing else — see Neptlium's provisioning sequence for the
model (sequential, named steps, each stays visible once complete).

---

# STATUS BADGES

Operational → Success (green). Pending → Warning (amber). Paused →
Information (blue). Archived → neutral (gray). Critical → Danger (red).

---

# ACCESSIBILITY

Minimum AA contrast. Visible keyboard focus on every interactive element.
ARIA labels on icon-only controls. Screen reader support. Respect
prefers-reduced-motion. No interaction may depend on color alone.

---

# RESPONSIVE BEHAVIOUR

Desktop-first, tablet-optimized, mobile-simplified. No horizontal scrolling.
Navigation collapses intelligently rather than breaking.

---

# GOLDEN RULE

Before merging any new component, page, feature, or interaction, answer:

1. Does it follow the global color system?
2. Does it use the approved spacing scale?
3. Does it use the typography hierarchy?
4. Does it follow semantic colors?
5. Does it respect institutional tone?
6. Does it feel like enterprise financial infrastructure?
7. Would this look appropriate in front of a pension fund manager, family
   office executive, sovereign wealth fund, or institutional investor?

If the answer to any of these is no, revise before merging.

---

# FIRST EXPERIENCE

Immediately after activation the user should never encounter an empty application.

Instead they arrive inside a prepared environment.

Good Morning, [Name]

Portfolio

Portfolio Value

Today's Performance

Available Cash

Capital Account

Recent Activity

Investment Status

Platform Status

Getting Started

Fund Wallet

The experience should communicate readiness.

---

# EMOTIONAL GOAL

Every interaction should reinforce one thought:

"This platform has been engineered to safeguard and operate serious capital."

Never:

"This is another fintech product."

Neptlium should feel less like software and more like secure institutional financial infrastructure.
