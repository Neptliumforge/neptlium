# Provider Doctrine Acceptance Criteria

The doctrine foundation is acceptable when:

- Circle, Alchemy and Stripe have one unambiguous strategic role each;
- Neptlium remains authoritative for identity/ownership, authorization, policy, intents, ledger, reconciliation and audit;
- provider configuration cannot be confused with execution authorization;
- provider evidence is explicitly non-canonical;
- multi-chain identity is Neptlium-owned and provider-neutral;
- chain registry membership does not enable deposits, withdrawals or contract execution;
- product boundaries consume Neptlium contracts rather than provider SDK domain models;
- open provider work that conflicts with the strategic set is identified for reconciliation before merge;
- production execution remains off until capability-specific certification passes.

Implementation beyond these acceptance criteria is intentionally split into subsequent dependency-safe slices.
