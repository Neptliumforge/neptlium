# NPA 1.0 — Neptlium Platform Architecture

Status: Approved baseline
Scope: Marketing platform representation + authenticated application evolution
Repository: `Neptliumlabs/neptlium`

## 1. Product definition

Neptlium is capital operating infrastructure for modern digital capital.

The operating environment is centered on five canonical destinations:

1. Overview
2. Portfolio
3. Capital Account
4. Treasury
5. Allocation

This information architecture is authoritative for both the authenticated application and the marketing-site representation of the platform.

Neptlium is not a retail trading interface, exchange, speculative crypto dashboard, automated trading bot, or generic fintech SaaS.

## 2. Architectural principle

The platform must feel like an institutional capital workstation rather than a collection of cards.

Depth is created through:

- governed canvas hierarchy;
- precise navigation planes;
- structural rules;
- measured spacing;
- restrained Neptlium-blue state signaling;
- strong information hierarchy;
- truthful empty states;
- minimal decorative treatment.

The system follows this depth model:

- L0 — Canvas
- L1 — Navigation rail
- L2 — Operating surfaces
- L3 — Capital information
- L4 — Decisions and actions
- L5 — System state

## 3. Canonical shell

Desktop authenticated shell:

- left sidebar / navigation rail;
- compact utility header;
- primary operating canvas;
- optional mobile bottom navigation on small screens.

The marketing hero must depict the same product model rather than an unrelated abstract dashboard.

The platform preview is a visual representation of the real Neptlium application architecture and must use the same terminology, product hierarchy, empty-state philosophy, typography system and color system.

## 4. Sidebar architecture

Canonical items:

- Overview
- Portfolio
- Capital Account
- Treasury
- Allocation

Desktop target:

- rail width approximately 216–232px;
- item height approximately 40–44px;
- typography approximately 14px / medium weight;
- neutral iconography;
- active state expressed through subtle surface elevation and restrained Neptlium-blue indicator;
- no large blue active-row fills;
- canonical Neptlium logo at top.

## 5. Utility header

The utility header is operational rather than promotional.

Target height: approximately 60–64px.

Primary responsibilities:

- identify current operating context;
- expose account/profile utility;
- support future global search only when a genuine product requirement exists.

It must remain visually subordinate to the operating canvas.

## 6. Overview architecture

The Overview page is the primary capital-state surface.

Top region:

- OVERVIEW
- Capital position
- Total capital
- Available
- Allocated
- Reserve

Capital metrics should live directly on the operating canvas where possible rather than inside redundant cards.

Use thin rules and spatial alignment to establish relationships.

If real values are unavailable, render truthful unavailable states such as `—` rather than fabricated balances.

Below the capital position:

- Capital Account
- Allocation
- Treasury
- Capital Activity

## 7. Capital Account

Capital Account is a primary product surface.

The architecture must support:

- account overview;
- supported capital;
- deposit;
- withdraw;
- transactions/history;
- available/reserved state;
- provider-observed balances where truthful and available.

Current supported capital direction:

- USDC / Base
- ETH / Base
- BTC / Bitcoin

The marketing platform preview may show these supported assets, but must never fabricate balances or transaction values.

## 8. Portfolio

Portfolio architecture should support:

- total portfolio position;
- holdings;
- composition;
- concentration;
- exposure;
- portfolio-level operating context.

The visual language should remain consistent with Overview and avoid exchange-style price-terminal presentation.

## 9. Treasury

Treasury architecture should support:

- liquidity position;
- reserves;
- exposure;
- treasury activity;
- readiness / operating-state information where available.

Example empty-state structure:

- TREASURY
- Liquidity position
- Available —
- Reserved —
- Exposure —
- No treasury data available yet.

## 10. Allocation

Allocation is organized around the approved lifecycle:

- Observed
- Modeled
- Executed

Current product truth must be preserved.

If no allocation policy exists, show:

- Current policy
- Not configured
- No allocation model is active.
- Create model

Future architecture may support drift, policy, review and approved execution states without changing the core visual system.

## 11. Capital Activity

Capital Activity must remain grounded in real transaction data.

If no transaction history exists, use the truthful empty state:

- No activity yet.
- Capital activity will appear here.

Never manufacture transactions, counterparties, percentages or volume to make the interface look populated.

## 12. Marketing platform representation

The first-view marketing hero should present an elite but truthful representation of the actual Neptlium operating environment.

Desktop composition:

- left: positioning copy and actions;
- right: real Neptlium platform window;
- platform window visibly includes the canonical navigation and core Overview architecture;
- platform data uses unavailable states where real data is not known;
- no fake metrics or customer information.

The marketing platform representation should not import authenticated application internals directly. Instead, both surfaces should derive from the same governed design and product architecture.

Relationship:

`Neptlium Design System -> Marketing platform representation`

`Neptlium Design System -> Authenticated application`

## 13. Platform window depth

The marketing preview should remain readable and operationally plausible.

Preferred depth treatment:

- straight or nearly straight UI plane;
- deep near-black shadow;
- subtle blue illumination behind one edge;
- thin internal border;
- low-contrast structural grid behind the preview;
- optional secondary foreground plane for depth;
- no glassmorphism-heavy treatment;
- no neon crypto graphics;
- no extreme 3D perspective.

## 14. Typography

NPA 1.0 inherits NTS 1.0 — Neptlium Typography System.

Authority comes from proportion, not volume.

The platform should use restrained headline scale, compact navigation typography, excellent numeric alignment and controlled text measure.

## 15. Color

The canonical Neptlium design tokens are authoritative.

Primary visual family:

- black / near-black;
- deep navy;
- Neptlium blue;
- white / off-white;
- neutral gray / blue-gray.

Decorative green, teal, purple, gold, rainbow or unrelated fintech gradients are prohibited in the core platform language.

Semantic success/warning/error colors may exist only where required to communicate genuine system state.

## 16. Product truthfulness

Never fabricate:

- account balances;
- AUM;
- returns;
- transaction activity;
- institutions;
- customers;
- certifications;
- partnerships;
- execution capabilities.

The platform should look sophisticated because the architecture is sophisticated, not because false information is added.

## 17. Future app upgrade target

The authenticated application should progressively move toward this architecture without changing its canonical product model.

Target structure:

### Overview
- Capital position
- Accounts
- Allocation
- Treasury
- Capital Activity

### Portfolio
- Portfolio position
- Holdings
- Composition
- Concentration
- Exposure

### Capital Account
- Overview
- Deposit
- Withdraw
- Transactions
- Supported capital

### Treasury
- Liquidity
- Reserve
- Exposure
- Treasury activity

### Allocation
- Observed
- Modeled
- Executed where supported
- Policy
- Drift

## 18. Governing principle

The marketing site must not invent a future Neptlium product merely for visual impact.

It must show an elite representation of the real platform Neptlium is building, and that representation becomes the design target for the authenticated platform's later upgrade.

NPA 1.0 is the approved baseline for that relationship.
