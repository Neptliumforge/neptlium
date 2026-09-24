# GitHub governance

## Verified state — 2026-09-24

The repository exposes no repository rulesets. The `main` branch is reported by the branches API as `protected: false`. The connected GitHub integration has repository content/admin metadata access but cannot read or mutate the branch-protection administration endpoint; the protection endpoint returns `403 Resource not accessible by integration`.

Therefore protection is a **configuration blocker**, not silently treated as complete.

## Required main policy

Configure GitHub so normal changes to `main` require a pull request; force pushes and branch deletion are blocked; conversations are resolved before merge; and administrators retain explicit emergency recovery rather than weakening normal policy.

Required checks must use exact stable check names and must not include path-filtered checks whose absence would deadlock unrelated PRs. Based on current workflow behavior, the stable always-on PR gates are:

- `CI / validate-stripe-ingress`
- `CI / validate-app`
- `CI / validate-web`
- `Supabase Auth Source Contract / retired-auth-contract`
- `Neptlium Product Family Validation / validate`

`Platform Core Validation / validate` and `Web Production Browser QA / Local production browser QA` are specialized path-aware gates and should not be globally required unless GitHub rules are configured to handle their non-applicable state safely.

Reverify exact check names immediately before enabling protection.
