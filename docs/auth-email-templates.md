# Neptlium Authentication Emails

Clerk is Neptlium's sole authentication, session, recovery, and MFA provider. Authentication email behavior and template activation are configured through Clerk, not Supabase Auth.

## Design rules

Authentication emails should be restrained, transactional, and unmistakably Neptlium:

- white or very light neutral content surface;
- Neptlium green `#0F8F86` as the primary action/brand accent;
- dark neutral body copy;
- system-safe typography;
- concise subject lines and one primary action;
- no newsletter, promotional, investment-performance, or product-sales content;
- no sensitive session/token values rendered visibly in body copy;
- accessible contrast, clear expiry/recovery language, and plain-text fallback.

## Clerk-managed flows

Depending on enabled Clerk configuration, transactional identity emails may include:

- email verification;
- sign-in verification/code or link;
- password recovery/reset when password authentication is enabled;
- email-address change verification;
- account invitations where configured;
- security notifications and recovery messaging supported by the active Clerk setup.

Prepared copy does not prove that a flow is enabled. Production activation, delivery domain, sender identity, redirect destinations, expiry, rate limits, and available factors must be verified in the active Clerk configuration.

## Brand identity

Use the canonical Neptlium mark with green geometry. Email assets should be hosted on a trusted Neptlium origin and use a format suitable for transactional email clients.

## Security guidance

- Never request a user's password, recovery code, MFA secret, or session token by email reply.
- Authentication links/codes must be generated and validated by Clerk.
- Redirect destinations must be approved Neptlium origins.
- Do not create custom email-token verification logic in `apps/app`, `apps/admin`, or Supabase.
- Security-sensitive identity changes should use Clerk's supported verification/step-up mechanisms.
