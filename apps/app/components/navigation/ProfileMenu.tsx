import Link from 'next/link';

interface ProfileMenuProps {
  readonly name: string;
  readonly email: string;
  readonly verified: boolean;
}

/** Compact account entry point. Account management lives on dedicated pages. */
export function ProfileMenu({ name, email }: ProfileMenuProps) {
  const initials = (name || email)
    .split(/\\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'N';

  return (
    <Link
      href="/dashboard/settings"
      aria-label="Account and settings"
      title="Account and settings"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-md px-1.5 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-xs font-semibold text-text-primary" aria-hidden="true">
        {initials}
      </span>
    </Link>
  );
}
