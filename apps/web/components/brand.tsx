import Link from 'next/link';

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Neptlium mark">
      <defs>
        <linearGradient id="brand-gradient" x1="8" y1="8" x2="56" y2="56">
          <stop stopColor="#2474ff" />
          <stop offset="1" stopColor="#55d9ff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="10" fill="#030508" />
      <path d="M10 11h29l-8 14H10V11Z" fill="url(#brand-gradient)" />
      <path d="M33 39h21v14H25l8-14Z" fill="url(#brand-gradient)" />
      <circle
        cx="32"
        cy="32"
        r="8.5"
        fill="#030508"
        stroke="url(#brand-gradient)"
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
