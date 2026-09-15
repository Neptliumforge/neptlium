# Provider Engineering Principles

1. Neptlium owns financial truth.
2. Providers expose bounded capabilities and evidence.
3. Circle is the strategic stablecoin/digital-money infrastructure adapter.
4. Alchemy is the strategic multi-chain connectivity/observation/intelligence adapter.
5. Stripe is the strategic fiat/payment/billing infrastructure adapter.
6. Provider SDKs stay behind server-side adapters.
7. Configuration never implies certification.
8. Certification never implies authorization of a specific intent.
9. Chain support never implies financial execution.
10. Provider balances never become a shadow ledger.
11. Every consequential operation is intent-first and idempotent.
12. Webhook/event evidence is authenticated, durable and replay-safe.
13. Ambiguous outcomes are recovered, not blindly retried.
14. Settlement and reconciliation are explicit separate states.
15. Capability gates are scoped by provider, operation, environment, asset/currency and network/rail.
16. Provider degradation fails closed for consequential actions.
17. Product applications consume Neptlium contracts, not provider domain models.
18. Provider replacement should not require rewriting the financial domain.
19. Production execution is an explicit release decision.
20. Documentation and implementation must evolve together.
