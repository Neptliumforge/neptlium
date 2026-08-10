import React from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Neptlium | Capital Operating Platform",
  description: "Governed capital operations platform",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" data-theme="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
