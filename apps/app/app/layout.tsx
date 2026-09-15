import React from "react";
import type { Metadata, Viewport } from "next";
import { assertProductionRuntimeConfig } from '@/lib/runtime-config';
import '@neptlium/ui/styles/nts.css';
import "./global.css";
import "./dashboard-v2.css";
import "./investment-dashboard.css";
import "./authenticated-product.css";
import "./authenticated-records.css";
import "./authenticated-mobile.css";

assertProductionRuntimeConfig();

export const metadata: Metadata = {
  title: "Neptlium Capital",
  description: "Personal investing, portfolio and wealth context in one governed financial environment.",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8F6" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
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
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    const resolved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = 'system';
    document.documentElement.style.colorScheme = resolved;
  }
})();`;

export default function RootLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
