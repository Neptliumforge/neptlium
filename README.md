# Neptlium 

> **Institutional Capital Operating System**

Neptlium is an institutional-grade capital operating system engineered to provide secure, governed, and intelligent infrastructure for professional investors, capital allocators, family offices, treasury teams, investment firms, and digital asset operators.

The platform is designed as institutional infrastructure — not a retail investment application.

Neptlium provides a unified operating environment for managing, monitoring, allocating, and governing digital and traditional capital through secure technology infrastructure.

---

# Brand Architecture

## Company

**Neptlium**

Institutional technology infrastructure company building intelligent systems for digital capital operations.

## Platform

**Neptlium**

The institutional capital operating platform.

## Domains

Public website:

```text
https://neptlium.com
```

Authenticated platform:

```text
https://app.neptlium.com
```

The marketing website and application platform are separate deployments but share the same backend infrastructure and design system.

---

# Vision

Neptlium exists to become the operating system for institutional digital capital.

Organizations should be able to operate every aspect of their capital from one secure control environment:

- Treasury oversight
- Portfolio intelligence
- Capital allocation
- Asset management
- Investor administration
- Operational governance
- Risk monitoring
- Institutional reporting
- Digital asset infrastructure

The platform prioritizes:

- Trust
- Governance
- Security
- Transparency
- Long-term maintainability

above rapid feature expansion.

---

# Engineering Philosophy

Every engineering decision must reinforce four principles:

## Infrastructure Before Investment

Build reliable systems before financial products.

## Governance Before Growth

Security, controls, and accountability come before scale.

## Intelligence Before Marketing

Build useful intelligence and operational capability before promotional growth.

## Trust Before Conversion

Institutional confidence is the foundation of adoption.

---

# Repository Architecture

Neptlium is a **Turborepo monorepo** containing independently deployable applications sharing common packages, design systems, domain libraries, and a unified Supabase backend.

```text
neptlium/

├── apps/
│   │
│   ├── web/
│   │   # Public institutional website
│   │
│   └── app/
│       # Authenticated capital operating platform
│
├── packages/
│   │
│   ├── ui/
│   │   # Shared Neptlium design system
│   │
│   ├── lib/
│   │   # Shared services and utilities
│   │
│   ├── config/
│   │   # Shared engineering configuration
│   │
│   └── types/
│       # Shared domain models
│
├── supabase/
│   │
│   ├── migrations/
│   ├── functions/
│   ├── storage/
│   └── policies/
│
├── .github/
│
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Applications

# apps/web

## Public Institutional Website

Purpose:

- Brand positioning
- Company narrative
- Institutional trust
- Research
- Security communication
- Governance
- Investor education
- Qualified user acquisition

Production:

```text
https://neptlium.com
```

The marketing website operates independently from the application platform.

---

# apps/app

## Institutional Capital Platform

Purpose:

The authenticated operating environment where users manage and monitor capital.

Capabilities:

- Executive dashboard
- Treasury management
- Portfolio intelligence
- Capital allocation
- Risk monitoring
- Reporting
- Investor operations
- Administrative workflows

Production:

```text
https://app.neptlium.com
```

---

# Shared Packages

## packages/ui

Neptlium global design system.

Contains:

- Design tokens
- Typography system
- Colors
- Layout primitives
- shadcn/ui components
- Radix UI primitives
- Buttons
- Forms
- Navigation
- Tables
- Cards
- Data visualization components
- Motion standards
- Brand assets

All applications must consume this system.

---

## packages/lib

Shared platform infrastructure.

Contains:

- Supabase clients
- Authentication helpers
- Database utilities
- Server utilities
- Browser utilities
- API clients
- Validation
- Security helpers
- Shared hooks

---

## packages/config

Shared configuration.

Contains:

- ESLint
- TypeScript
- Tailwind
- Prettier
- Build configuration

---

## packages/types

Shared domain models.

Examples:

- User
- Role
- Organization
- Investor
- Portfolio
- TreasuryAccount
- CapitalAccount
- Allocation
- Transaction
- LedgerEntry
- Notification
- AuditLog
- Document

---

# Backend Infrastructure

All applications connect to one external Supabase project.

Supabase is the authoritative backend layer.

Services include:

- Supabase Auth
- PostgreSQL
- Row Level Security
- Storage
- Edge Functions
- Database migrations
- Realtime

Frontend applications must consume existing backend infrastructure.

Do not recreate database systems inside applications.

---

# Identity & Access

Neptlium authentication is powered by:

## Supabase Auth

Responsibilities:

- User registration
- Login
- Sessions
- Email verification
- Password recovery
- Identity management

Application database stores:

- Profiles
- Roles
- Permissions
- Organizations
- Platform metadata

---

# Existing Domain Modules

## Identity

Infrastructure:

- profiles
- user_roles
- aliases

Roles:

- user
- operator
- analyst
- manager
- admin
- super_admin

Authorization is enforced through:

- Supabase Auth
- Row Level Security
- Server-side validation

---

# Treasury Infrastructure

Capabilities:

- Account balances
- Ledger entries
- Deposits
- Withdrawal requests
- Payment intents
- On-chain transactions

Purpose:

Institutional treasury visibility and capital movement tracking.

---

# Portfolio Intelligence

Infrastructure:

- Portfolios
- Holdings
- Assets
- Yield records

Capabilities:

- Portfolio composition
- Exposure analysis
- Performance intelligence
- Asset monitoring

---

# Allocation Engine

Infrastructure:

- Strategies
- Strategy allocations
- Capital allocations
- Protocol records

Capabilities:

- Capital deployment
- Strategy management
- Institutional allocation workflows

---

# Risk Intelligence

Infrastructure:

- Risk scores
- Market signals
- Whale signals
- Rebalancing events

Capabilities:

- Exposure monitoring
- Risk analysis
- Market intelligence

---

# Operations

Infrastructure:

- Audit logs
- Notifications
- Administrative workflows

Capabilities:

- Governance
- Accountability
- Operational visibility
- Institutional reporting

---

# Billing

Infrastructure:

- Subscriptions
- Payment intents

---

# Security Standards

Security is foundational.

Mandatory requirements:

- Row Level Security
- Least privilege access
- Role-based authorization
- Protected routes
- Session validation
- Audit logging
- Secure API communication
- Server-side permission enforcement

Frontend restrictions improve UX.

Supabase RLS remains the final security authority.

---

# Design System Principles

Neptlium follows an institutional technology aesthetic.

Reference direction:

- Bloomberg Terminal
- Stripe Dashboard
- Mercury
- Ramp
- Coinbase Prime

Avoid:

- Retail crypto aesthetics
- Meme styling
- Neon palettes
- Gamification
- Excessive animations

Design language:

- Deep black backgrounds
- Controlled blue accents
- White clarity
- Executive typography
- Dense information hierarchy
- Minimal luxury
- Institutional confidence

---

# Deployment Architecture

Applications deploy independently.

## Marketing

Repository:

```text
apps/web
```

Domain:

```text
https://neptlium.com
```

---

## Platform

Repository:

```text
apps/app
```

Domain:

```text
https://app.neptlium.com
```

---

Both applications share:

- Supabase backend
- Design system
- Shared libraries
- Domain models

---

# Development Commands

Install:

```bash
pnpm install
```

Development:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Type checking:

```bash
pnpm check-types
```

---

# Engineering Rules

Every contribution must be:

- Type-safe
- Secure
- Accessible
- Responsive
- Tested
- Documented
- Production-ready
- Scalable

Never introduce:

- Fake financial data
- Mock users
- Placeholder security
- Client-only authorization
- Unprotected database access

---

# Development Roadmap

## Phase 1 — Foundation

Complete:

- Turborepo architecture
- Shared packages
- Supabase integration
- Authentication
- CI/CD
- Production deployment foundation

---

## Phase 2 — Institutional Website

Build:

- Brand platform
- Research
- Security
- Governance
- Institutional education

---

## Phase 3 — Capital Operating Platform

Build:

- Dashboard
- Treasury
- Portfolio intelligence
- Reporting
- Notifications

---

## Phase 4 — Capital Operations

Build:

- Ledger workflows
- Deposits
- Withdrawals
- Approvals
- Settlement operations

---

## Phase 5 — Institutional Administration

Build:

- Investor management
- Compliance workflows
- Audit systems
- Analytics
- Reporting

---

# Mission

Neptlium Systems is building the infrastructure layer for institutional digital capital.

Every product decision, engineering decision, and design decision must reinforce:

**Security. Governance. Intelligence. Trust.**
