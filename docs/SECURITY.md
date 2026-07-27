# Security

Supabase Auth and PostgreSQL RLS are primary identity and authorization boundaries.

- UI restrictions do not replace server authorization or RLS.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and out of logs, client bundles, and tracked files.
- Validate external input and provider events.
- Require idempotency, reconciliation, explicit authorization, and audit records before financial execution.
- Never fabricate financial or provider states, certifications, or regulatory approval.
- Keep Authorize unavailable until real ledger, custody, security, and execution infrastructure exists.

Coinbase CDP and Alchemy integrations are not complete. Missing provider credentials must not block frontend deployment.

Report vulnerabilities privately to repository owners or `support@neptlium.com`. Preserve [production containment history](security/SUPABASE_PRODUCTION_CONTAINMENT.md) and applied migrations.
