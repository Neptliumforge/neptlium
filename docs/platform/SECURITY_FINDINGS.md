# Security finding continuity

**Review date:** 2026-09-24. This document preserves current engineering status without publishing credential values.

| Finding | Status | Evidence / next action |
| --- | --- | --- |
| User-editable compliance authority risk | **OPEN** | Historical `profiles_update_own` permits owner UPDATE and `compliance_status` remains an authoritative profile field consumed by API authorization. No forward migration was found that clearly makes that column server-only. Tracked in issue #109; production grants/policies require verification. |
| Synthetic/randomized intelligence represented as financial fact | **MITIGATED / production verification required** | Gate 05 identified legacy `calculate-yield` as synthetic canonical mutation. Forward migration `20260913052329_gate05_retire_legacy_financial_authority.sql` unschedules `calculate-yield-daily`, and regression tests assert retirement. Applied production state was not re-proven in this repository-only pass. |
| Embedded scheduled bearer credential | **OPEN** | Gate 05 records that a non-financial market-signal cron embeds a privileged bearer credential. No credential is reproduced here. Migrate that scheduler to safer secret delivery in a dedicated security task. |
| Legacy deployed code / repository reproducibility gaps | **MITIGATED / partially unverified** | Canonical Git/Vercel project mapping and SHA-bearing deployment evidence are documented. Some documentation-only commits are intentionally ignored/cancelled by Vercel, and exact custom-domain/project-setting inspection remains connector-limited. |
| Admin deployment/build convergence | **MITIGATED by finalization CI change** | `@neptlium/admin` has typecheck/lint/test/build scripts. Finalization adds an explicit CI Admin job; final status depends on the PR head check. |
| API deployment traceability | **MITIGATED / runtime version verification required** | API CI runs typecheck/lint/test/`vercel-build`; Vercel records Git SHAs. Exact current production deployment must still be read from deployment evidence rather than inferred from source. |

## Authority

An unresolved security finding must not be hidden by archival cleanup. Historical Gate records are preserved under `docs/archive/**`, while this document carries current status forward.

No finding in this document authorizes financial execution, provider activation, schema redesign, or weakening of fail-closed controls.
