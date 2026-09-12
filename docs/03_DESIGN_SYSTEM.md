# NEPTLIUM Design System — Remediation Mode

## Purpose

The design system supports one product identity across Web, App, and Admin while preserving each surface's responsibility. During production remediation, visual polish must not obscure incomplete financial capability or collapse distinct operational states into optimistic labels.

## Core rule

**Design may clarify state; it may not manufacture certainty.**

UI components that represent money, identity, provider execution, settlement, or reconciliation must reflect the canonical domain state returned by the API.

## Required state semantics

Designs must visually and linguistically distinguish:

- empty vs zero;
- pending vs failed;
- approved vs submitted;
- submitted vs settled;
- settled vs reconciled;
- available vs reserved/restricted;
- provider-observed vs canonical;
- configured vs unavailable/live.

Do not use generic success styling for intermediate financial states.

## Surface behavior

### Web
May communicate intended product value and architecture, but may not claim live execution, settlement, custody, provider relationships, balances, AUM, performance, licences, or availability without evidence.

### App
Must show explicit lifecycle states and recovery/error states. It must not fake balances, transaction history, portfolio data, or treasury state while canonical repositories are incomplete.

### Admin
Must emphasize evidence, provenance, discrepancy state, request IDs, provider references, settlement evidence, reconciliation status, and audit history. Dangerous actions require deliberate confirmation and must remain visibly governed.

## Remediation UI priorities

Until gates 01-16 are complete, design work should primarily support:

1. clear legacy-path containment messaging where needed;
2. canonical funding and withdrawal lifecycle states;
3. provider-webhook/reconciliation operator visibility;
4. identity migration/recovery states;
5. explicit unavailable/not-configured/blocked states;
6. accessibility and error comprehension for production-critical flows.

Nonessential visual redesign should not delay remediation.

## Final rewrite

After remediation closes, rewrite this document with the final production component/state vocabulary and remove temporary remediation-specific guidance.
