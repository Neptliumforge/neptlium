# Neptlium Master Product Experience v1

## Product hierarchy

```text
NEPTLIUM
├── Capital — individuals / investing / portfolio / wealth
├── Treasury — businesses / payments / stablecoins / approvals / policies
├── Institutional — funds / family offices / asset managers / APIs
└── Infrastructure — Pay / API / Docs / Status
```

Neptlium is one financial operating environment with multiple explicit ownership contexts. Authentication establishes a person. It does not grant financial authority.

Canonical authority chain:

```text
Identity → Owner → Membership → Role → Permission → Policy → Approval → Action
```

## Experience signature

**Understand before acting. Review before consequence. Keep context after movement.**

Marketing is spacious. Capital is personal and clear. Treasury is operational and controlled. Institutional is contextually dense. Infrastructure is technically precise.

## Capital onboarding

Long-term sequence:

1. Secure account
2. Personal identity
3. Financial profile
4. Investment profile
5. Security hardening
6. Connect capital
7. Review and agreements
8. Activation / first-run guidance

Capital never asks for organization, director, UBO or team concepts during personal onboarding. Current implementation must only collect fields supported by authoritative persistence and eligibility infrastructure; future phases should be added progressively rather than simulated.

## Treasury onboarding

Long-term sequence:

1. Secure human identity
2. Create organization
3. Business purpose and expected activity
4. Legal ownership and control persons where required
5. Treasury architecture / accounts
6. Connect and verify treasury sources
7. Invite team and assign roles
8. Configure approval and policy defaults
9. Configure counterparties / payment operations
10. Review readiness and activate

Legal ownership and Neptlium operating permissions are separate concepts. Operators do not implicitly approve. Approvers do not implicitly operate.

Treasury onboarding states should converge on an explicit state machine rather than boolean combinations:

```text
SETUP_STARTED
IDENTITY_PENDING
ORGANIZATION_PENDING
CONTROL_PERSONS_PENDING
TREASURY_CONNECTION_PENDING
POLICY_SETUP_PENDING
REVIEW_PENDING
ACTIVE
RESTRICTED
SUSPENDED
```

## Institutional onboarding

Institutional extends Treasury's organization/authority plane with legal entities, mandates, portfolios, AUM context, custody relationships, administrators, reporting requirements and delegated teams. It must support assisted onboarding. Planned capabilities must be labeled as planned until authoritative services exist.

## Infrastructure onboarding

Developer journey:

```text
Identity → Organization → Developer workspace → Environment → API credential → Quickstart → Webhook → First verified integration event
```

Public clients never receive server financial authority.

## Typography — NTS

Shared semantic roles:

- Display XL: 88px desktop / 52px mobile, 500, 0.96, -0.045em
- Hero: 72px / 48px, 500, 1.00, -0.045em
- H1: 56px / 40px, 500, 1.05, -0.04em
- H2: 40px / 32px, 500, 1.10, -0.03em
- H3: 28px / 26px, 500, 1.15, -0.025em
- Lead: 24px / 20px, 400, 1.45, -0.015em
- Body Large: 18px / 1.55
- Body: 16px / 1.55
- Small: 14px / 1.45
- Label: 12px / 1.30 / 600

Marketing may use large roles; application dashboards should normally top out around 32px except exceptional first-run moments.

## Marketing architecture

Primary navigation:

```text
Capital | Treasury | Institutional | Infrastructure | Insights | Company
```

Hero:

> Capital, clearly.
>
> One place to understand, coordinate and move through your financial world with context intact.

Do not place a redundant `NEPTLIUM` eyebrow above a page hero when the logo already establishes brand identity. Eyebrows are metadata, not decoration.

## Footer

The footer must not duplicate the mobile navigation directory. It closes the experience with brand identity, status, security/legal links, maintained social destinations and copyright. Never hardcode an operational status; link to the real Status product unless live status is fetched from an authoritative source.

## Financial action model

```text
Observe → Understand → Prepare → Review → Authorize → Execute → Settle → Reconcile → Record
```

Observed provider or blockchain state is not automatically canonical financial state. Submitted is not settled. Settled is not automatically reconciled.

## Empty/error state standard

Empty states answer: what is this, why it matters, what can I do next?

Errors distinguish stale data, provider outage, permission failure, policy rejection, settlement failure and system failure. Do not collapse these into “Something went wrong.”

## Implementation order

1. Product taxonomy
2. NTS shared typography tokens
3. Shared navigation
4. Marketing hierarchy normalization
5. Minimal status-aware footer
6. Capital onboarding expansion as authoritative persistence becomes available
7. Treasury organization onboarding
8. Treasury roles/policies/approvals
9. Institutional extension
10. Infrastructure onboarding and environment controls
11. Cross-context switching
12. Responsive/accessibility QA

## Strategic benchmark

Execution quality should synthesize principles from Robinhood, Mercury, Brex, Ramp, Bloomberg, Plasma, Coinbase, Zengo, Fireblocks, Stripe, Vercel, Linear, Apple, Interactive Brokers and Wealthfront without cloning any proprietary interface or brand.

Neptlium's desired character is:

**Large but controlled. Quiet but confident. Technical but human. Premium but functional. Dense when necessary. Spacious when communicating.**
