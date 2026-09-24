# Security

Neptlium is financial infrastructure. Security reports should avoid public disclosure of exploitable details or credentials. Use the repository owner's private security contact/channel where available; do not open a public issue containing secrets, private keys, production tokens, customer data, or an unpatched exploit.

## Secret handling

Never commit credentials, Supabase service-role keys, provider secrets, bearer tokens, signing material, wallet private keys, recovery material, production cookies, or sensitive webhook payloads. Browser applications may contain only values explicitly designed to be public.

Development, preview, staging, and production credentials must remain isolated. Provider test credentials must not be treated as production capability.

## Financial security principles

- Neptlium's double-entry ledger is canonical financial truth.
- Provider state is evidence, not automatic ledger, settlement, reconciliation, availability, or balance authority.
- Authentication does not grant financial or administrative authorization.
- Policy/preflight, authorization, ownership, idempotency, replay protection, RLS, and audit controls fail closed.
- Intelligence/model output is observational unless a separately governed deterministic authority explicitly states otherwise.
- Applied database migrations are historical evidence and must not be rewritten.

## Provider credentials

Provider SDKs and secrets stay server-side within reviewed boundaries. Do not activate providers or execution capabilities as part of repository maintenance.

## Incidents

For a suspected production incident, preserve evidence, revoke/rotate exposed credentials through the owning provider, contain affected capability, and follow current operator/runbook authority. Never paste live credentials into issues, pull requests, documentation, logs, or chat transcripts.
