import Image from 'next/image';
import Link from 'next/link';

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Image className={className} src="/icon.svg" width={64} height={64} alt="Neptlium" priority />
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
