# NEPTLIUM Provider Architecture — Remediation Mode

## Provider role

Providers execute external actions or supply external evidence. They never directly define canonical customer balances or accounting truth.

## Supported remediation scope

Current remediation focuses on the provider paths required for production funding/withdrawal correctness:

- Circle outbound transfer submission and settlement evidence;
- Circle/Alchemy authenticated webhook or event ingestion;
- Stripe webhook ingress where Stripe remains in launch scope;
- provider references, inbox persistence, replay protection, retries, dead-letter handling, and reconciliation.

## Outbound execution contract

Every irreversible provider command must have:

- server-side credential isolation;
- supported environment/asset/network gating;
- deterministic idempotency;
- exact atomic amount conversion;
- durable local execution record before/around the external effect;
- durable provider-reference persistence;
- recoverability after timeout/crash/unknown response;
- no automatic interpretation of provider acceptance as settlement.

## Inbound event contract

Every provider callback/event must follow:

```text
raw request
  -> official signature/authentication verification
  -> normalize provider/event/environment identity
  -> persist provider_webhook_inbox
  -> deduplicate
  -> idempotent worker processing
  -> attach provider reference / settlement evidence
  -> validate lifecycle transition
  -> ledger/reconciliation work
```

Invalid authentication, malformed identity, unsupported environment, or ambiguous transaction matching fails closed.

## Current production transition

Legacy Stripe and crypto/deposit Edge Functions do not satisfy the target contract and must be disabled, retired, or replaced through gates 01-08. The canonical provider inbox exists in production but had no lifecycle rows at audit time.

## Secret handling

Provider secret audits verify only names/presence/scope/runtime use. Secret values must never be emitted into docs, logs, chat, PRs, screenshots, or client bundles.

## Final rewrite

After gates 04, 07, 08, 09, 10, 11, 13, and 16 are complete, rewrite this document with the final provider matrix, supported environments/networks/assets, retry semantics, webhook contracts, and operational ownership.
