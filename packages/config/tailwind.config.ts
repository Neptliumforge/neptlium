import type { Config } from "tailwindcss";

const neptliumTheme: Config = {
  content: [],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "#0B1016",
        surface: "#121B26",
        card: "#1B2736",
        border: "#283A4C",
        primary: {
          DEFAULT: "#4D82FF",
          foreground: "#FFFFFF"
        },
        secondary: {
          DEFAULT: "#2BD4FF",
          foreground: "#0B1016"
        },
        accent: {
          DEFAULT: "#F6C24A",
          foreground: "#0B1016"
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#0B1016"
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#0B1016"
        },
        error: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF"
        }
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        "inter-tight": ["Inter Tight", "system-ui", "sans-serif"]
      },
      spacing: {
        px: "1px",
        0: "0px",
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem"
      },
      borderRadius: {
        none: "0px",
        sm: "0.375rem",
        DEFAULT: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        full: "9999px"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.08)",
        panel: "0 20px 60px rgba(0, 0, 0, 0.12)",
        glow: "0 0 0 1px rgba(77, 130, 255, 0.12), 0 20px 60px rgba(77, 130, 255, 0.18)"
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
          sm: "2rem",
          lg: "4rem"
        }
      },
      animation: {
        fade: "fade 0.4s ease-in-out forwards",
        float: "float 4s ease-in-out infinite",
        pulsefast: "pulsefast 1.5s ease-in-out infinite"
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulsefast: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" }
        }
      }
    }
  }
};

export default neptliumTheme;
