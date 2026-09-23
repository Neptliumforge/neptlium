'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (value: ThemePreference) => void;
}

const STORAGE_KEY = 'neptlium-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = preference === 'system' ? systemTheme() : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemePreference =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setPreferenceState(initial);
    setResolved(applyTheme(initial));

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if ((window.localStorage.getItem(STORAGE_KEY) ?? 'system') === 'system') {
        setResolved(applyTheme('system'));
      }
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const setPreference = useCallback((value: ThemePreference) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setPreferenceState(value);
    setResolved(applyTheme(value));
  }, []);

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export const themeBootScript = `(() => {
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
