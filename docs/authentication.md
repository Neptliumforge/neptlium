# Neptlium Authentication Architecture

## Overview

Neptlium uses **Supabase Auth** as the core identity and authentication system.

Authentication is designed for an institutional capital operating platform where security, governance, and user identity integrity are foundational.

The authentication architecture consists of:

- Supabase Auth — identity management and authentication
- Supabase PostgreSQL — application data layer
- Supabase Row Level Security — authorization enforcement
- Resend — transactional email delivery infrastructure
- Neptlium application — user experience layer

The marketing website (`https://neptlium.com`) is separate from authentication.

Authentication exists only inside:

```text
https://app.neptlium.com
```

---

# Authentication Responsibilities

## Supabase Auth

Supabase Auth is responsible for:

- User registration
- User identity creation
- Password authentication
- Session management
- Email verification state
- Password recovery
- Secure token handling
- Authentication lifecycle

Supabase Auth remains the source of truth for user identity.

---

## Supabase Database

The database manages application-level identity and platform access.

Examples:

- profiles
- organizations
- user roles
- onboarding status
- account metadata
- security events
- application permissions

The application database must never replace Supabase Auth.

---

## Resend Email Infrastructure

Neptlium uses **Resend** as the production transactional email delivery provider.

Resend is responsible for delivering:

- Email verification codes
- Password reset emails
- Security notifications
- Account notifications
- Future operational emails

Resend does not authenticate users.

The authentication relationship is:

```
Supabase Auth
        |
        |
        ▼
Generate authentication email event
        |
        |
        ▼
Resend SMTP Delivery
        |
        |
        ▼
User receives Neptlium email
```

---

# Email Verification Flow

Neptlium uses an OTP verification experience.

Users verify their account inside the application.

The user should not need to leave Neptlium and open a verification link from Gmail.

The expected flow:

```
User creates account

        ↓

Supabase Auth creates user record

        ↓

Verification OTP generated

        ↓

Resend delivers verification email

        ↓

User enters verification code inside Neptlium

        ↓

Supabase validates OTP

        ↓

Email becomes verified

        ↓

User continues onboarding

        ↓

Dashboard access
```

---

# OTP Verification Requirements

The verification system must:

- Generate secure verification codes
- Deliver codes through Resend
- Validate codes through Supabase Auth
- Expire unused codes
- Limit resend attempts
- Prevent brute-force attempts
- Never expose verification tokens in logs
- Never store plaintext verification secrets

Users should receive a clean experience:

```
Enter verification code

[  _  _  _  _  _  _  ]

Didn't receive a code?

Resend code
```

---

# Resend Configuration

Production email delivery uses Resend SMTP.

Supabase connects to Resend through SMTP configuration.

Required Resend setup:

1. Create Resend account.

2. Verify the Neptlium sending domain.

Recommended:

```
auth.neptlium.com
```

or

```
mail.neptlium.com
```

3. Configure DNS records in Namecheap:

- SPF
- DKIM
- DMARC where applicable

4. Create a dedicated Resend API key.

5. Configure Supabase SMTP.

---

# Supabase SMTP Configuration

Location:

```
Supabase Dashboard

→ Authentication

→ SMTP Settings
```

Configuration:

```
Provider:
Custom SMTP

Host:
smtp.resend.com

Port:
465

Username:
resend

Password:
Resend API Key
```

Sender example:

```
Neptlium

verify@auth.neptlium.com
```

---

# Email Templates

Supabase email templates must support the Neptlium OTP experience.

Location:

```
Supabase Dashboard

→ Authentication

→ Email Templates
```

---

# Confirm Signup Email

Purpose:

Deliver account verification code.

Example:

Subject:

```
Your Neptlium verification code
```

Body:

```
Welcome to Neptlium.

Your verification code is:

{{ .Token }}

Enter this code inside the Neptlium application.

This code expires shortly.

If you did not create this account, ignore this email.
```

Requirements:

- Clear code visibility
- No external verification dependency
- No unnecessary links
- Professional institutional tone

---

# Password Reset Email

Purpose:

Allow users to securely recover account access.

Requirements:

- Secure expiration
- Approved redirect URLs only
- No token exposure
- Resend delivery

Example:

Subject:

```
Reset your Neptlium password
```

---

# Security Notification Emails

Future notifications may include:

- New login detected
- Password changed
- New device access
- Transfer approval
- Withdrawal confirmation
- Account changes

All delivered through Resend.

---

# Authentication Routes

Production application:

```
https://app.neptlium.com
```

Authentication routes:

```
/sign-up

/sign-in

/verify-email

/forgot-password

/update-password

/onboarding

/dashboard
```

Only application routes should be used for authentication redirects.

The marketing website is not part of authentication routing.

---

# Session Architecture

Sessions are managed by Supabase Auth.

Requirements:

- Secure cookies
- Server-side session validation
- Token refresh handling
- Protected application routes
- No client-only authorization

Authentication state must survive:

- Browser refresh
- Returning visits
- Multiple tabs
- Token renewal

---

# Protected Routes

Protected routes include:

```
/dashboard

/wallet

/portfolio

/treasury

/transfers

/reports

/settings
```

Unauthenticated users must be redirected to:

```
/sign-in
```

Authenticated users without completed onboarding must go to:

```
/onboarding
```

Completed users may access:

```
/dashboard
```

---

# User Provisioning

When a user signs up:

```
Supabase Auth User

        ↓

Application Profile

        ↓

Onboarding Record

        ↓

Platform Access
```

Requirements:

- One auth user = one profile
- No duplicate profiles
- User identity comes from Supabase Auth
- Client cannot create arbitrary users
- Client cannot assign privileged roles

---

# Row Level Security

Supabase RLS remains the authorization authority.

Requirements:

- Users can only access their own data
- Organizations enforce membership permissions
- Roles are protected
- Sensitive operations require server validation
- Service role access remains server-only

Frontend checks improve UX only.

They do not replace RLS.

---

# Environment Variables

Required production variables:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=https://app.neptlium.com
```

Never expose:

```
SUPABASE_SERVICE_ROLE_KEY
```

to browser code.

---

# Technical Implementation

## Client Architecture

Four Supabase clients serve distinct contexts inside `apps/app`:

| Client | Path | Context |
|--------|------|---------|
| Browser | `@neptlium/lib/supabase` → `src/supabase/browser.ts` | Client Components — reads/writes session cookies via `createBrowserClient` |
| Server | `@neptlium/lib/supabase/server` | Server Components, Route Handlers, Server Actions — per-request via `createServerClient` |
| Middleware | `@neptlium/lib/supabase/middleware` | `apps/app/proxy.ts` — refreshes access token on every request (Next.js 16: `proxy.ts` replaces `middleware.ts`) |
| Admin | `@neptlium/lib/supabase/admin` | Server Actions only — uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS |

The Admin client is never imported in any client bundle.

---

## Sign-Up and OTP Verification (Code-Level Flow)

`SignupForm.tsx` is a three-step client component at `/signup`:

### Step 1 — Identity
User enters first name, last name, email. Validated client-side before advancing.

### Step 2 — Credentials
User enters password, confirm password, and accepts Terms of Service.

On submit, the `signup` server action (`apps/app/app/(auth)/actions.ts`) is called:

```ts
supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/confirm`,
    data: { first_name, last_name, full_name },
  },
})
```

Supabase creates an unconfirmed user and emails a **6-digit OTP code** via Resend.

Account-enumeration protection: existing and new email addresses receive the same
"check your email" response. Only genuine network/rate-limit errors produce error messages.

### Step 3 — OTP Verification
On `signup` success the form transitions to the verify step. The `OtpInput` component
(`apps/app/app/(auth)/components/OtpInput.tsx`) renders six individual digit inputs
with paste support and `autocomplete="one-time-code"`.

On submit, the `verifyEmailOtp` server action is called:

```ts
supabase.auth.verifyOtp({ email, token, type: "email" })
```

On success: records a `signup` security event, records the trusted device, redirects to `/onboarding`.

On failure: returns a typed error without redirecting — the user can retry or resend.

| Supabase error | User message |
|----------------|--------------|
| `expired` | "Code expired. Request a new one below." |
| `invalid` / `not found` | "Incorrect code. Check your email and try again." |
| Rate limit | "Too many attempts. Please wait before trying again." |

**Resend:** The resend button (30 s client-side cooldown) calls:

```ts
supabase.auth.resend({ type: "signup", email })
```

This triggers a new OTP code using the same email template.

---

## Email Confirmation Route (Link-Based — Password Recovery Only)

Route: `/auth/confirm` (GET handler)

This route is used for **password recovery**, not signup. Recovery emails land on
`/auth/confirm?token_hash=...&type=recovery`.

1. Route Handler reads `token_hash` and `type` from the query string.
2. Calls `supabase.auth.verifyOtp({ type, token_hash })`.
3. On success for `recovery`: redirects to `/update-password`.
4. On failure: redirects to `/auth-error`.

---

## Database Trigger

The `handle_new_user` trigger fires on `auth.users INSERT` and creates a row in
`public.profiles`:

```sql
id, email, full_name, first_name, last_name  -- from auth.users.raw_user_meta_data
```

Uses `ON CONFLICT (id) DO UPDATE` — safe to fire more than once.

---

## Supabase Dashboard Configuration

### Authentication > Settings

```
Confirm email:          enabled
Email OTP expiry:       3600  (1 hour)
Secure email change:    enabled
Password min length:    8
```

### Authentication > URL Configuration

Site URL:
```
https://app.neptlium.com
```

Redirect URLs:
```
https://app.neptlium.com/auth/confirm
https://app.neptlium.com/update-password
http://localhost:3001/auth/confirm
http://localhost:3001/update-password
https://*.vercel.app/auth/confirm
https://*.vercel.app/update-password
```

### Authentication > Email Templates

**Confirm signup** — set subject and body to deliver the OTP code (see "Confirm Signup Email" section above). Use `{{ .Token }}`, not `{{ .ConfirmationURL }}`.

**Reset password** — keep `{{ .ConfirmationURL }}` which resolves to `/auth/confirm?type=recovery&token_hash=...`.

---

## Protected Route Guards

```
requireUser()             — unauthenticated → /login
requireProvisionedUser()  — no profile.provisioned_at → /onboarding
requireRole(minRole)      — insufficient RBAC role → /dashboard
```

Guards use `redirect()` from `next/navigation` — unauthenticated users never see
protected content even briefly. No redirect cycles exist.

---

## Security Events

The `login_history` table records key authentication events:

| Event | Trigger |
|-------|---------|
| `signup` | Email OTP verified |
| `login` | Successful sign-in |
| `logout` | Explicit sign-out |
| `password_updated` | Password changed |
| `password_reset_requested` | Recovery email sent |
| `mfa_enrolled` | TOTP enrolled |
| `mfa_unenrolled` | TOTP removed |
| `sessions_revoked` | Other sessions ended |

Sensitive data (passwords, tokens, codes) is never stored.

---

# Production Checklist

Before onboarding real users:

## Supabase

- Authentication enabled
- Email provider configured
- OTP flow tested
- SMTP connected to Resend
- Redirect URLs configured
- RLS verified
- Migrations applied
- Database backups enabled

---

## Resend

- Domain verified
- DNS records active
- SMTP credentials configured
- Sending reputation monitored

---

## Application

- Signup tested
- Verification code tested
- Login tested
- Password recovery tested
- Session persistence tested
- Sign out tested
- Dashboard access tested
- Protected routes tested

---

# Final Authentication Flow

```
Create Account

↓

Receive Neptlium OTP Email

↓

Enter Verification Code

↓

Supabase Confirms Identity

↓

Create Application Profile

↓

Complete Onboarding

↓

Access Neptlium Dashboard

↓

Manage Institutional Capital Operations
```

Neptlium authentication is built around:

**Secure Identity. Verified Access. Institutional Trust.**