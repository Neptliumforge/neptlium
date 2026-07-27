import type { ReactNode } from "react";

export interface AuthLayoutProps {
  readonly children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 py-12">
      {children}
    </main>
  );
}
