'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '@neptlium/ui';

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  const items: ReadonlyArray<readonly [ThemePreference, typeof Sun, string]> = [
    ['light', Sun, 'Light'],
    ['dark', Moon, 'Dark'],
    ['system', Laptop, 'System'],
  ];

  return <div className="theme-switcher" aria-label="Appearance">
    {items.map(([value, Icon, label]) => <button key={value} type="button" onClick={() => setPreference(value)} aria-pressed={preference === value} aria-label={label} title={label}><Icon size={15}/><span>{label}</span></button>)}
  </div>;
}
