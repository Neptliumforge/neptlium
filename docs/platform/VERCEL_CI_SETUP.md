# Vercel CI — initial setup

Neptlium's GitHub repository is already linked to eight Vercel projects under team `neptliumforge`: `neptlium-api`, `neptlium-app`, `neptlium-admin`, `neptlium-treasury`, `neptlium-pay`, `neptlium-status`, `neptlium-docs`, and `neptlium-web` (connection verified 2026-11-16).

## Selected initial tasks

1. **Integration contracts**: Check that every Git-linked application has a build, lint, and typecheck script; parse any app-level `vercel.json`; assert builds do not invoke Vercel deployment commands.
2. **Shared UI typecheck**: Verify the shared component package used by the product family.

Both tasks run for pull requests to `main` that touch application or shared code; the lightweight integration audit can also be dispatched manually. The workflow is read-only and does not use Vercel credentials. Existing CI workflows continue to run application builds, tests, and database-contract checks.

## Operational boundary

Vercel Git integration manages Preview deployments separately from this workflow. This change **does not** configure Vercel Deployment Checks, GitHub branch-protection required checks, project settings, production promotion, or Vercel environment variables. Those controls require separate verification and authorization. Do not add `VERCEL_TOKEN` to pull-request jobs.

## Validation and release

Review the PR's `Vercel project integration contracts` and `Shared UI typecheck` checks. If checks cannot run due to GitHub Actions resource limits, leave this PR unmerged until they can be verified. Existing retired-authentication reference audit failures are independent blockers and must not be bypassed.

## Skill execution note

The requested `npx skills use vercel/ci@setup` command timed out in the execution environment. This setup follows the available Vercel deployment/CI guidance instead and should not be represented as the completed output of that CLI skill.
