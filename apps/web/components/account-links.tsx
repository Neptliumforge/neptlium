import { cn } from '@/lib/utils'
import { SITE } from '@/lib/content/site'

/*
 * Account actions link to the Neptlium application. These are Neptlium
 * domains, so they navigate normally (no new tab). Registration and
 * sign-in are intentionally NOT implemented inside this marketing site.
 */

export function CreateAccountLink({
  className,
  variant = 'accent',
  children = 'Create account',
}: {
  className?: string
  variant?: 'accent' | 'ink' | 'outline' | 'outline-inverse'
  children?: React.ReactNode
}) {
  return (
    <a href={SITE.signUpUrl} className={cn('btn', `btn-${variant}`, className)}>
      {children}
    </a>
  )
}

export function SignInLink({
  className,
  variant = 'ghost',
  children = 'Sign in',
}: {
  className?: string
  variant?: 'ghost' | 'outline' | 'outline-inverse'
  children?: React.ReactNode
}) {
  return (
    <a href={SITE.signInUrl} className={cn('btn', `btn-${variant}`, className)}>
      {children}
    </a>
  )
}
