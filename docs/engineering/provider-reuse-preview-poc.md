# Reuse-first provider assessment — Preview-only proof of concept

## Inspection evidence
- `apps/api/src/providers.ts` defines the domain-owned `CapitalProvider` interface, disabled provider, and local-only test webhook verifier.
- `apps/api/src/circle.ts` already wraps the official Circle SDK behind that contract; its transfer path is deliberately disabled/unimplemented.
- `apps/api/src/asset-registry.ts` declares assets and candidate capabilities but expressly does not activate them.
- `apps/api/test/provider-runtime.test.mjs` checks environment and economic gates; configured credentials alone do not authorize financial execution.

## Candidate ranking (engineering judgment; estimates not measured)
| Candidate | Savings potential | Maintenance / security risk | Licensing / ownership | Product value | Decision |
| --- | --- | --- | --- | --- | --- |
| Reuse existing Circle SDK adapter | High (avoids rebuilding provider transport) | Medium (upstream SDK drift) | Vendor SDK terms must be verified | High | Retain; no new integration |
| Reuse existing viem for EVM validation | Medium | Medium (chain/version compatibility) | MIT; verify pinned dependency and notices | Medium | Candidate for later isolated evaluation |
| Adopt generic provider orchestration framework | Uncertain | High (financial semantics and vendor coupling) | Package-specific; not assessed | Uncertain | Reject for this phase |
| Extract a pure capability assessment from existing gates | Medium (less duplicate conditional logic) | Low (no I/O or provider authority) | Repository-owned, no new third-party dependency | High for operator diagnostics | **Selected PoC** |

## Selected PoC
`apps/api/src/provider-capability-assessment.ts` is a pure, read-only evaluator with fail-closed tests in `apps/api/test/provider-capability-assessment.test.mjs`. It introduces no dependency, network call, API route, database write, production flag, or financial authorization. Its positive result is **advisory only** and cannot replace tenant authorization, execution policy, provider verification, posting or reconciliation.

## Acceptance and ownership
- Owner: API / financial-platform engineering; security reviewer required before runtime integration.
- Required checks: API TypeScript build, unit tests, lint, Preview deployment and regression checks.
- Review existing capability-state vocabulary before mapping this PoC into production domains; the PoC is intentionally not wired to any runtime path.
- Confirm external license/notice and dependency versions before adopting any third-party alternative.
- Do not merge or enable production execution on the basis of this PoC.
