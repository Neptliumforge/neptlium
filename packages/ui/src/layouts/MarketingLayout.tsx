import type { ReactNode } from "react";

export interface MarketingLayoutProps {
  readonly children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return <div className="min-h-dvh bg-canvas text-text-primary">{children}</div>;
}
