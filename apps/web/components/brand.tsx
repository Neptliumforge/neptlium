import Link from 'next/link';

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Neptlium mark">
      <rect width="64" height="64" rx="10" fill="var(--nt-bg-inset)" />
      <path d="M10 11h29l-8 14H10V11Z" fill="var(--nt-signal-indigo)" />
      <path d="M33 39h21v14H25l8-14Z" fill="var(--nt-signal-indigo)" />
      <circle
        cx="32"
        cy="32"
        r="8.5"
        fill="var(--nt-bg-inset)"
        stroke="var(--nt-signal-indigo)"
        strokeWidth="4"
      />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="Neptlium home">
      <BrandMark className="brand-mark" />
      {!compact && <span>Neptlium</span>}
    </Link>
  );
}
