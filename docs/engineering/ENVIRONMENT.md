# Environment contract

Environment variables are configuration inputs, not capability or authority.

## Classification

| Name | Owner | Applications | Exposure | Phase | Requirement |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth | App, Treasury, Admin | Public | runtime | required for authenticated browser sessions |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Auth | App, Treasury, Admin | Public | runtime | required for authenticated browser sessions |
| `NEXT_PUBLIC_SITE_URL` | application | App, Treasury, Pay, Admin where declared | Public | build/runtime | production origin contract |
| `NEPTLIUM_API_URL` | platform | App, Treasury, Pay, Admin | Server configuration | runtime | API origin |
| `SUPABASE_URL` | platform | API | Server-only | runtime | durable Supabase endpoint |
| `SUPABASE_ANON_KEY` | Supabase compatibility/auth verification | API | Server configuration; public-class key but not browser API contract | runtime | currently consumed by API bearer verification |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase | API | Server configuration | runtime | declared compatibility/migration variable; verify consumer before removal |
| `SUPABASE_SERVICE_ROLE_KEY` | platform | API | **Server-only secret** | runtime | privileged persistence boundary |

The API example also declares provider/capability configuration for Circle, Alchemy, Stripe, origins, logging, and mainnet/capability gates. Those values remain server-only where secret or privileged. Presence never proves a live capability.

## Supabase naming

Browser applications have converged on `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The API still consumes `SUPABASE_ANON_KEY` for server-side Supabase Auth token verification and also declares `SUPABASE_PUBLISHABLE_KEY`. Do not rename or remove either API variable until runtime consumers and deployed Vercel scopes are migrated deliberately.

## Rules

Never commit values for secrets. Never expose service-role, provider secret, webhook signing, wallet signing, or private-key material through `NEXT_PUBLIC_*`. Production, preview, and development scopes must be isolated. Feature gates and provider credentials are not interchangeable: credentials do not activate capability.
