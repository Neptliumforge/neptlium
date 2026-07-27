import type { ReactNode } from "react";

export interface AppLayoutProps {
  readonly children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return <div className="min-h-dvh bg-canvas text-text-primary">{children}</div>;
}
