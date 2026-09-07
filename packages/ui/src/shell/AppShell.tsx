import type { ReactElement, ReactNode } from 'react';
import { NeptliumMark } from './NeptliumMark';

export interface AppShellProps {
  readonly children: ReactNode;
  readonly sidebar?: ReactNode;
  readonly sidebarFooter?: ReactNode;
  readonly mobileNav?: ReactNode;
  readonly utility?: ReactNode;
  readonly header?: ReactNode;
  readonly brandDescriptor?: string;
}

export function AppShell({
  children,
  sidebar,
  sidebarFooter,
  mobileNav,
  utility,
  header,
  brandDescriptor,
}: AppShellProps): ReactElement {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r border-border-hairline bg-sidebar lg:flex xl:w-[252px]">
        <div className="flex h-16 shrink-0 items-center justify-center gap-2.5 border-b border-border-hairline px-3 xl:justify-start xl:px-5">
          <NeptliumMark size={22} />
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-body-sm font-semibold tracking-tight text-sidebar-text-primary">Neptlium</p>
            {brandDescriptor ? <p className="mt-0.5 truncate text-[10px] font-medium tracking-[0.03em] text-sidebar-text-muted">{brandDescriptor}</p> : null}
          </div>
        </div>
        {sidebar ? (
          <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-2.5 py-4 xl:px-3">
            {sidebar}
          </nav>
        ) : null}
        {sidebarFooter ? (
          <nav aria-label="Workspace navigation" className="max-h-[42vh] shrink-0 overflow-y-auto border-t border-border-hairline px-2.5 py-3 xl:px-3">{sidebarFooter}</nav>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[72px] xl:pl-[252px]">
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-border-hairline bg-topnav lg:hidden">
          {mobileNav ?? (
            <div className="flex h-full items-center px-4">
              <NeptliumMark size={22} />
            </div>
          )}
        </header>
        <header className="hidden h-16 shrink-0 items-center justify-between gap-6 border-b border-border-hairline bg-topnav px-6 lg:flex xl:px-8">
          <div className="min-w-0 flex-1">{header}</div>
          <div className="shrink-0">{utility}</div>
        </header>

        <main className="min-w-0 flex-1 px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-4 sm:pt-6 md:px-6 lg:px-7 lg:py-7 xl:px-9">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
