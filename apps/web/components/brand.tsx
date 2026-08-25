import Link from 'next/link';
import { NeptliumMark, type NeptliumMarkTone } from '@neptlium/ui';

export function BrandMark({
  className = '',
  tone = 'current',
}: {
  className?: string;
  tone?: NeptliumMarkTone;
}) {
  return <NeptliumMark className={className} size={30} tone={tone} />;
}

export function Brand({
  compact = false,
  tone = 'current',
}: {
  compact?: boolean;
  tone?: NeptliumMarkTone;
}) {
  return (
    <Link href="/" className="brand" aria-label="Neptlium home">
      {!compact && <span>Neptlium</span>}
      <BrandMark className="brand-mark" tone={tone} />
    </Link>
  );
}
