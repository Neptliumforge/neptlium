# Neptlium Authentication Emails

Supabase Auth is Neptlium's sole active authentication and session provider. Authentication email behavior and template activation are configured through Supabase Auth.

## Design rules

Authentication emails should be restrained, transactional, and unmistakably Neptlium:

- white or very light neutral content surface;
- Neptlium Mineral Teal as the primary action/brand accent;
- dark neutral body copy;
- system-safe typography;
- concise subject lines and one primary action;
- no newsletter, promotional, investment-performance, or product-sales content;
- no sensitive session/token values rendered visibly in body copy;
- accessible contrast, clear expiry/recovery language, and plain-text fallback.

## Supabase-managed flows

Depending on enabled Supabase Auth configuration, transactional identity emails may include:

- email verification;
- password recovery/reset when password authentication is enabled;
- email-address change verification;
- invitations where configured;
- security/recovery messaging supported by the active Supabase Auth setup.

Prepared copy does not prove that a flow is enabled. Production activation, delivery domain, sender identity, redirect destinations, expiry, rate limits, and available factors must be verified in the active Supabase configuration.

## Brand identity

Use the canonical Neptlium mark with approved brand geometry. Email assets should be hosted on a trusted Neptlium origin and use a format suitable for transactional email clients.

## Security guidance

- Never request a user's password, recovery code, MFA secret, refresh token, or session token by email reply.
- Authentication links/codes must be generated and validated by Supabase Auth.
- Redirect destinations must be approved Neptlium origins.
- Do not create custom email-token verification logic in `apps/app` or `apps/admin` when the provider flow already owns verification.
- Security-sensitive identity changes should use the supported Supabase Auth verification/step-up mechanisms when available and reviewed.
