# Neptlium Auth Email Templates

Neptlium authentication emails use a restrained transactional design system.

## Brand rules

- Outer background: `#F7F8FA`
- Content background: `#FFFFFF`
- Primary text: `#111827`
- Secondary text: `#667085`
- Tertiary text: `#98A2B3`
- Divider: `#EAECF0`
- Primary CTA: `#0B8CFF`
- CTA text: white
- Maximum content width: `560px`
- Button radius: `8px`
- Logo display size: `48x48`
- System font stack only
- Table-based layout
- Inline CSS
- No JavaScript
- No external stylesheets
- No newsletter or promotional styling

## Logo

Public email logo URL:

`https://neptlium.com/neptlium-email-logo.png`

The asset should be a white-background email-safe adaptation of the canonical Neptlium mark, while preserving the canonical blue/cyan geometry.

## Supabase variables

Actionable templates use:

`{{ .ConfirmationURL }}`

Do not replace this with OTP token variables unless the authentication architecture intentionally changes.

## Prepared templates

- Confirm signup
- Reset password
- Change email
- Invite user
- Magic link
- Password changed
- Email changed

Prepared templates are not proof that the corresponding production flow is enabled.

Production activation must be reviewed separately in Supabase Auth configuration.
