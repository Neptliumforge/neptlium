import type { ReactNode } from 'react';

export function WorkspaceHeader({
  title,
  description,
  eyebrow,
  meta,
  action,
}: {
  readonly title: string;
  readonly description: string;
  readonly eyebrow?: string;
  readonly meta?: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <header className="border-b border-border-hairline pb-5 sm:pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? (
            <p className="mb-1.5 text-[11px] font-medium tracking-[0.03em] text-text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h1>{title}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-text-muted">{description}</p>
        </div>
        {action ? <div className="w-full shrink-0 md:w-auto">{action}</div> : null}
      </div>
      {meta ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-hairline pt-3 text-xs text-text-muted">
          {meta}
        </div>
      ) : null}
    </header>
  );
}
