import React from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./global.css";

export const metadata: Metadata = {
  title: "Neptlium Admin Console",
  description: "Internal platform administration — Neptlium"
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <ClerkProvider signInUrl="/login">
      <html lang="en" data-theme="light">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
