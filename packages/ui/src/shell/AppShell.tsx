import type { ReactElement, ReactNode } from "react";
import { NeptliumMark } from "./NeptliumMark";

export interface AppShellProps {
  readonly children: ReactNode;
  readonly sidebar?: ReactNode;
  readonly sidebarFooter?: ReactNode;
  readonly mobileNav?: ReactNode;
  readonly utility?: ReactNode;
  readonly header?: ReactNode;
}

export function AppShell({
  children,
  sidebar,
  sidebarFooter,
  mobileNav,
  utility,
}: AppShellProps): ReactElement {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border-hairline bg-sidebar lg:flex">
        <div className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-border-hairline px-5">
          <NeptliumMark size={22} />
          <span className="text-body-sm font-semibold tracking-tight">
            Neptlium
          </span>
        </div>
        {sidebar && (
          <nav
            aria-label="Primary navigation"
            className="flex-1 overflow-y-auto px-3 py-4"
          >
            {sidebar}
          </nav>
        )}
        {sidebarFooter && (
          <div className="shrink-0 border-t border-border-hairline p-3">
            {sidebarFooter}
          </div>
        )}
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-border-hairline bg-topnav lg:hidden">
          {mobileNav ?? (
            <div className="flex h-full items-center px-4">
              <NeptliumMark size={22} />
            </div>
          )}
        </header>
        <header className="hidden h-[72px] shrink-0 items-center justify-end border-b border-border-hairline bg-topnav px-8 lg:flex">
          {utility}
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
