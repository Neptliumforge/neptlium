import Link from 'next/link';

interface ProfileMenuProps {
  readonly name: string;
  readonly email: string;
  readonly verified: boolean;
}

/** Compact account entry point. Account actions live on dedicated settings pages. */
export function ProfileMenu({ name, email, verified }: ProfileMenuProps) {
  const initials =
    (name || email)
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'N';

  return (
    <Link
      href="/dashboard/settings"
      aria-label={`Account settings for ${name || email || 'your account'}${verified ? ', identity verified' : ''}`}
      className="flex min-h-11 items-center gap-2 rounded-md px-1.5 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-xs font-semibold" aria-hidden="true">
        {initials}
      </span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block max-w-36 truncate text-sm text-text-primary">{name}</span>
        <span className="block max-w-36 truncate text-[11px] text-text-muted">{email || 'Email not provided'}</span>
      </span>
    </Link>
  );
}
