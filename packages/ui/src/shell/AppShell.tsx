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
    <div className="neptlium-environment min-h-screen overflow-x-hidden text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col border-r border-sidebar-border-hairline bg-sidebar lg:flex xl:w-[236px]">
        <div className="flex h-[72px] shrink-0 items-center justify-center gap-2.5 border-b border-sidebar-border-hairline px-3 xl:justify-start xl:px-5">
          <NeptliumMark size={23} tone="paper" />
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-[12px] font-semibold uppercase tracking-[0.16em] text-sidebar-text-primary">NEPTLIUM</p>
            {brandDescriptor ? <p className="mt-1 truncate text-[10px] font-medium tracking-[0.04em] text-sidebar-text-muted">{brandDescriptor}</p> : null}
          </div>
        </div>

        {sidebar ? (
          <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-2.5 py-5 xl:px-3">
            {sidebar}
          </nav>
        ) : null}

        {sidebarFooter ? (
          <nav aria-label="Workspace navigation" className="max-h-[38vh] shrink-0 overflow-y-auto border-t border-sidebar-border-hairline px-2.5 py-4 xl:px-3">
            {sidebarFooter}
          </nav>
        ) : null}
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[72px] xl:pl-[236px]">
        <header className="sticky top-0 z-30 h-[64px] shrink-0 border-b border-border-hairline bg-topnav backdrop-blur-xl lg:hidden">
          {mobileNav ?? (
            <div className="flex h-full items-center px-4">
              <NeptliumMark size={22} />
            </div>
          )}
        </header>

        <header className="sticky top-0 z-20 hidden h-[72px] shrink-0 items-center justify-between gap-6 border-b border-border-hairline bg-topnav px-7 backdrop-blur-xl lg:flex xl:px-10">
          <div className="min-w-0 flex-1">{header}</div>
          <div className="shrink-0">{utility}</div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-7 sm:px-6 sm:pt-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
