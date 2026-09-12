# NEPTLIUM Authentication Email Templates — Remediation Mode

## Identity transition status

Clerk is the target browser/session authentication authority, but Supabase Auth still exists for legacy production identities. This document therefore describes transitional email behavior only; prepared Supabase templates do not imply that Supabase Auth remains the long-term product identity system.

## Brand rules

Authentication emails remain restrained transactional messages:

- outer background `#F7F8FA`;
- content background `#FFFFFF`;
- primary text `#111827`;
- secondary text `#667085`;
- tertiary text `#98A2B3`;
- divider `#EAECF0`;
- primary CTA `#0B8CFF` with white text;
- maximum content width `560px`;
- button radius `8px`;
- logo display size `48x48`;
- system font stack;
- table-based layout and inline CSS;
- no JavaScript, external stylesheets, newsletter, or promotional styling.

Public email logo asset: `https://neptlium.com/neptlium-email-logo.png`.

## Supabase legacy templates

Where Supabase Auth remains intentionally enabled during migration, actionable templates use the provider-supported confirmation URL contract. Do not introduce custom token handling merely to preserve a legacy flow.

Legacy Supabase templates may include signup confirmation, password reset, email change, invite, magic link, password-changed, and email-changed messages. Their existence is configuration/documentation only and does not prove production activation.

## Clerk target state

New authentication/recovery email behavior should follow the final Clerk configuration and verified account-recovery design. Do not add new dependence on Supabase email flows while the identity cutover gate is active.

## Security rules

- never include secrets, internal IDs, privileged tokens, provider credentials, or financial data in email templates;
- links must originate from the configured identity provider and approved product domain;
- account recovery must fail closed when identity continuity is ambiguous;
- operator/admin recovery requires the final privileged-access policy, not a generic customer template.

## Completion condition

After Gate 15 in `docs/15_PRODUCTION_READINESS_AUDIT.md` is complete, rewrite this document again to remove retired Supabase Auth email guidance and document the final Clerk production templates/recovery contract.
