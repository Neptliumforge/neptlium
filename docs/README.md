# Neptlium documentation

This is the knowledge router. **Current authority is subject-based.** Files under `archive/**` are historical evidence and compatibility paths at the docs root are not independent authorities.

## Current authority

- **Product:** [Product constitution](product/PRODUCT.md), [Hierarchy](product/HIERARCHY.md), [Capital](product/CAPITAL.md), [Treasury](product/TREASURY.md), [Pay](product/PAY.md), [Capital/Treasury account boundaries](product/ACCOUNT_BOUNDARIES.md)
- **Architecture:** [Platform architecture](architecture/ARCHITECTURE.md), [API](architecture/API.md), [ADRs](architecture/ADR/README.md)
- **Financial:** [Capital Account](financial/CAPITAL_ACCOUNT.md), [Funding](financial/FUNDING.md), [Transfers](financial/TRANSFERS.md), [Ledger and reconciliation](financial/LEDGER_AND_RECONCILIATION.md), [Allocation](financial/ALLOCATION.md)
- **Platform:** [Identity](platform/IDENTITY.md), [Providers](platform/PROVIDERS.md), [Security](platform/SECURITY.md), [Security findings](platform/SECURITY_FINDINGS.md), [Authentication emails](platform/AUTH_EMAILS.md)
- **Experience:** [Design system](experience/DESIGN_SYSTEM.md), [Asset authority](experience/ASSETS.md), [Product experience](experience/PRODUCT_EXPERIENCE.md)
- **Engineering:** [Development](engineering/DEVELOPMENT.md), [CI](engineering/CI.md), [Environment](engineering/ENVIRONMENT.md), [GitHub governance](engineering/GITHUB_GOVERNANCE.md), [Branch hygiene](engineering/BRANCH_HYGIENE.md)
- **Operations:** [Deployment](operations/DEPLOYMENT.md), [Deployment architecture](operations/DEPLOYMENT_ARCHITECTURE.md), [Vercel](operations/VERCEL.md), [Admin operations](operations/ADMIN.md)
- **Classification evidence:** [Documentation classification](DOCUMENT_CLASSIFICATION.md)

## Historical / archived

`archive/**` preserves historical prompts, audits, phase records, remediation evidence, and superseded material. Archived documents must not be used to infer current product availability, financial authority, provider activation, production configuration, or repository policy.

## Authority rule

Chronology does not establish authority. When documentation conflicts with current source, tests, configuration, migrations, or verified runtime state, investigate the conflict rather than creating another authority. Correct the current authoritative document in the same change when practical.
