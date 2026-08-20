import React from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./global.css";

export const metadata: Metadata = {
  title: "Neptlium | Capital Operating Platform",
  description: "Governed capital operations platform",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <html lang="en" suppressHydrationWarning>
        <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
