import React from "react";
import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./global.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-inter-sans",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Neptlium Admin Console",
  description: "Internal platform administration — Neptlium"
};

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
