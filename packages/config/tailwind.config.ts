import type { Config } from 'tailwindcss';

const neptliumTheme: Config = {
  content: [],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F5F3EE',
        card: '#FFFFFF',
        border: '#D8D5CE',
        primary: { DEFAULT: '#101214', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#343A3F', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#0F8F86', foreground: '#FFFFFF' },
        success: { DEFAULT: '#2D7A58', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#A86F16', foreground: '#FFFFFF' },
        error: { DEFAULT: '#B33A34', foreground: '#FFFFFF' },
      },
      fontFamily: {
        sans: ['Geist', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SFMono-Regular', 'ui-monospace', 'monospace'],
      },
      spacing: {
        px: '1px',
        0: '0px',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
      },
      borderRadius: {
        none: '0px',
        sm: '0.25rem',
        DEFAULT: '0.25rem',
        md: '0.5rem',
        lg: '0.5rem',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        soft: '0 1px 2px rgba(16, 18, 20, 0.06)',
        panel: '0 12px 32px rgba(16, 18, 20, 0.10)',
      },
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.25rem', lg: '2rem' },
        screens: { '2xl': '1280px' },
      },
      animation: {
        fade: 'fade 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
};

export default neptliumTheme;
