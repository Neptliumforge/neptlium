/**
 * Neptlium Design System — Tailwind v3 base config
 *
 * apps/web usage:
 *   import baseConfig from "@neptlium/design-system/tailwind";
 *   export default { ...baseConfig, content: ["./src/**\/*.{ts,tsx}"] };
 *
 * Color values reference canonical semantic CSS variables defined
 * in @neptlium/ui/styles/tokens.css.
 */
import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-sans)"],
        body:    ["var(--font-sans)"],
        mono:    ["var(--font-mono)"],
      },
      colors: {
        border:     "var(--color-border-default)",
        input:      "var(--color-surface-inset)",
        ring:       "var(--color-border-focus)",
        background: "var(--color-canvas)",
        foreground: "var(--color-text-primary)",
        panel:      "var(--color-panel)",
        elevated:   "var(--color-surface-raised)",
        primary: {
          DEFAULT:    "var(--color-accent-primary)",
          foreground: "var(--color-accent-primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--color-surface-secondary)",
          foreground: "var(--color-text-primary)",
        },
        destructive: {
          DEFAULT:    "var(--color-danger)",
          foreground: "var(--color-danger-foreground)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        muted: {
          DEFAULT:    "var(--color-surface-secondary)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT:    "var(--color-surface-raised)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT:    "var(--color-surface-floating)",
          foreground: "var(--color-text-primary)",
        },
        card: {
          DEFAULT:    "var(--color-card)",
          foreground: "var(--color-text-primary)",
        },
        sidebar: {
          DEFAULT:              "var(--color-sidebar)",
          foreground:           "var(--color-text-secondary)",
          primary:              "var(--color-accent-primary)",
          "primary-foreground": "var(--color-accent-primary-foreground)",
          accent:               "var(--color-surface-secondary)",
          "accent-foreground":  "var(--color-text-primary)",
          border:               "var(--color-border-hairline)",
          ring:                 "var(--color-border-focus)",
        },
      },
      backgroundImage: {
        "gradient-cta":     "var(--gradient-cta-primary)",
      },
      boxShadow: {
        elevated:    "var(--shadow-elevation-3)",
        glow:        "var(--shadow-glow)",
        card:        "var(--shadow-elevation-1)",
        "focus-ring": "var(--shadow-focus-ring)",
      },
      borderRadius: {
        lg:   "var(--radius-md)",
        md:   "var(--radius-sm)",
        sm:   "var(--radius-xs)",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ds-shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down var(--motion-duration-normal) var(--motion-ease-out)",
        "accordion-up":   "accordion-up var(--motion-duration-normal) var(--motion-ease-out)",
        "fade-up":        "fade-up var(--motion-duration-slow) cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":        "fade-in var(--motion-duration-slow) ease-out both",
        shimmer:          "ds-shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
