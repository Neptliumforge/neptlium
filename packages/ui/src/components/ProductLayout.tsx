import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './utils/cn';

export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-6', className)} {...props} />;
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md bg-surface-1', className)} {...props} />;
}

export function Group({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('divide-y divide-border-hairline', className)} {...props} />;
}

export function Row({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex min-h-14 items-center justify-between gap-4 py-3', className)}
      {...props}
    />
  );
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-0 border-t border-border-hairline', className)} {...props} />;
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: HTMLAttributes<HTMLElement> & {
  readonly title?: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <header className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
