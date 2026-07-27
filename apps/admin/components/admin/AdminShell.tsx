import type { ReactNode } from "react";
import { NeptliumMark } from "@neptlium/ui";


interface AdminShellProps {
  readonly sidebar: ReactNode;
  readonly topbar: ReactNode;
  readonly children: ReactNode;
}

export function AdminShell({ sidebar, topbar, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* Fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border-hairline bg-[#030508]">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border-hairline px-4">
          <NeptliumMark size={22} />
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted leading-none">
              Neptlium
            </p>
            <p className="text-[9px] font-semibold tracking-wider uppercase text-accent-primary leading-none mt-0.5">
              Admin Console
            </p>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">{sidebar}</nav>
      </aside>

      {/* Content area */}
      <div className="ml-60 flex min-h-screen flex-col">
        {/* Fixed topbar */}
        <header className="fixed top-0 left-60 right-0 z-30 flex h-14 items-center border-b border-border-hairline bg-topnav px-6">
          {topbar}
        </header>
        {/* Main content */}
        <main className="mt-14 flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
