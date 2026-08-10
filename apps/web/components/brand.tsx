import Link from 'next/link';
import { NeptliumMark, type NeptliumMarkTone } from '@neptlium/ui';

export function BrandMark({
  className = '',
  tone = 'blue',
}: {
  className?: string;
  tone?: NeptliumMarkTone;
}) {
  return <NeptliumMark className={className} size={30} tone={tone} />;
}

export function Brand({
  compact = false,
  tone = 'ink',
}: {
  compact?: boolean;
  tone?: NeptliumMarkTone;
}) {
  return (
    <Link href="/" className="brand" aria-label="Neptlium home">
      <BrandMark className="brand-mark" tone={tone} />
      {!compact && <span>Neptlium</span>}
    </Link>
  );
}
