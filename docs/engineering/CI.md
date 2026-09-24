# Continuous integration

GitHub Actions is the repository validation authority for pull requests.

Current specialized workflows:

- **CI** — API, App, Web, shared UI validation and builds.
- **Supabase Auth Source Contract** — enforces Supabase Auth-only source policy.
- **Platform Core Validation** — API and platform-core migration authority checks.
- **Neptlium Product Family Validation** — Treasury, Pay, Docs, Status, Web and shared product hierarchy validation.
- **Web Production Browser QA** — production-build browser QA for Web when relevant paths change.

A green check proves only the scope that workflow actually executed. Skipped or path-filtered workflows must not be represented as validation of unrelated code.

Main-branch protection should require stable applicable checks only after their exact GitHub check names and skip behavior have been verified. Do not configure required checks in a way that deadlocks documentation-only or path-filtered pull requests.
