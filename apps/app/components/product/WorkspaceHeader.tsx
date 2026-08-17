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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.09em] text-text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h1>{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {meta ? <div className="mt-4 text-xs text-text-muted">{meta}</div> : null}
    </header>
  );
}
