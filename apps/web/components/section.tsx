import { cn } from '@/lib/utils';

/** Vertical rhythm wrapper matching the spec's section spacing scale. */
export function Section({
  children,
  className,
  tone = 'default',
  as: Tag = 'section',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'surface' | 'subtle' | 'ink';
  as?: 'section' | 'div';
} & React.HTMLAttributes<HTMLElement>) {
  const toneMap = {
    default: 'bg-background text-text',
    surface: 'bg-surface text-text',
    subtle: 'bg-surface-subtle text-text',
    ink: 'bg-navigation text-inverse',
  };
  return (
    <Tag className={cn('py-[72px] md:py-24 lg:py-[120px]', toneMap[tone], className)} {...rest}>
      <div className="container-page">{children}</div>
    </Tag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  inverse = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow && <p className={cn('eyebrow mb-3', inverse && 'text-inverse/60')}>{eyebrow}</p>}
      <h2
        className={cn(
          'text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl lg:text-[2.125rem]',
          inverse ? 'text-inverse' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-pretty text-base leading-relaxed md:text-lg',
            inverse ? 'text-inverse/70' : 'text-muted',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
