import React from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { assertProductionRuntimeConfig } from '@/lib/runtime-config';
import "./global.css";
import "./dashboard-v2.css";

assertProductionRuntimeConfig();

export const metadata: Metadata = {
  title: "Neptlium | Capital Operating Platform",
  description: "Governed capital operations platform",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E0D" },
  ],
};

const themeBoot = `(() => {
  try {
    const stored = localStorage.getItem('neptlium-theme');
    const preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const resolved = preference === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
  } catch (_) {
    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.themePreference = 'system';
  }
})();`;

export default function RootLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body className="antialiased">
        <ClerkProvider signInUrl="/" signUpUrl="/auth/sign-up">
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
