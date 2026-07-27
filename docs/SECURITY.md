# Security

Neptlium uses Supabase Auth and PostgreSQL Row Level Security as core identity and authorization boundaries.

- Keep publishable and service-role clients separate.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Enforce authorization server-side and in RLS; UI restrictions are not security controls.
- Validate all external input and provider events.
- Require idempotency, reconciliation, and audit records for financial operations.
- Do not display fabricated balances, holdings, addresses, or transaction states.

Report suspected vulnerabilities privately to the repository owners. Do not include credentials, personal data, or exploitable production details in public issues.

See `docs/security/SUPABASE_PRODUCTION_CONTAINMENT.md` for historical containment work and `docs/SUPABASE.md` for local backend guidance.
