import type { ReactElement, ReactNode } from 'react';
import { NeptliumMark, type NeptliumMarkTone } from './NeptliumMark';

export interface AppShellProps {
  readonly children: ReactNode;
  readonly sidebar?: ReactNode;
  readonly sidebarFooter?: ReactNode;
  readonly mobileNav?: ReactNode;
  readonly utility?: ReactNode;
  readonly header?: ReactNode;
  readonly brandDescriptor?: string;
  readonly brandTone?: NeptliumMarkTone;
}

export function AppShell({
  children,
  sidebar,
  sidebarFooter,
  mobileNav,
  utility,
  header,
  brandDescriptor,
  brandTone = 'paper',
}: AppShellProps): ReactElement {
  return (
    <div className="neptlium-environment min-h-screen overflow-x-hidden text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[68px] flex-col border-r border-sidebar-border-hairline bg-sidebar lg:flex xl:w-[228px]">
        <div className="flex h-[64px] shrink-0 items-center justify-center gap-2.5 border-b border-sidebar-border-hairline px-3 xl:justify-start xl:px-5">
          <NeptliumMark size={22} tone={brandTone} />
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-[12px] font-semibold uppercase tracking-[0.16em] text-sidebar-text-primary">NEPTLIUM</p>
            {brandDescriptor ? <p className="mt-0.5 truncate text-[10px] font-medium text-sidebar-text-muted">{brandDescriptor}</p> : null}
          </div>
        </div>

        {sidebar ? (
          <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-2 py-4 xl:px-3">
            {sidebar}
          </nav>
        ) : null}

        {sidebarFooter ? (
          <nav aria-label="Workspace navigation" className="max-h-[38vh] shrink-0 overflow-y-auto border-t border-sidebar-border-hairline px-2 py-3.5 xl:px-3">
            {sidebarFooter}
          </nav>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[68px] xl:pl-[228px]">
        <header className="sticky top-0 z-30 h-[60px] shrink-0 border-b border-border-hairline bg-topnav lg:hidden">
          {mobileNav ?? (
            <div className="flex h-full items-center px-4">
              <NeptliumMark size={21} tone={brandTone === 'paper' ? 'ink' : brandTone} />
            </div>
          )}
        </header>

        <header className="sticky top-0 z-20 hidden h-[64px] shrink-0 items-center justify-between gap-6 border-b border-border-hairline bg-topnav px-6 lg:flex xl:px-9">
          <div className="min-w-0 flex-1">{header}</div>
          <div className="shrink-0">{utility}</div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-7 lg:px-7 lg:py-8 xl:px-10 xl:py-9">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
