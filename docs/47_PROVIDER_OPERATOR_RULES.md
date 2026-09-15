# Provider Operator Rules

- Never paste provider secret values into tickets, chat, docs or Git.
- Add only environment variables consumed by the deployed code contract.
- Keep preview/test credentials separate from production.
- Redeploy the affected server project after environment changes.
- Treat credential presence as `CONFIGURED`, never `CERTIFIED` or `EXECUTION_ENABLED`.
- Certify Alchemy network-by-network.
- Certify Circle operation-by-operation.
- Keep Stripe billing and capital-funding status separate.
- Do not enable economic gates to diagnose configuration problems.
- If provider outcome is ambiguous, use lookup/reconciliation rather than retrying blindly.
- Record production certification using PASS/FAIL/BLOCKED/NOT RUN only.
