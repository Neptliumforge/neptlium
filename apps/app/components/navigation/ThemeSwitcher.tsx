'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Preference = 'light' | 'dark' | 'system';

function resolve(preference: Preference) {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useState<Preference>('system');
  useEffect(() => {
    const stored = document.documentElement.dataset.themePreference as Preference | undefined;
    if (stored) setPreference(stored);
  }, []);

  function setTheme(next: Preference) {
    localStorage.setItem('neptlium-theme', next);
    document.documentElement.dataset.themePreference = next;
    document.documentElement.dataset.theme = resolve(next);
    setPreference(next);
  }

  const items = [
    ['light', Sun, 'Light'],
    ['dark', Moon, 'Dark'],
    ['system', Laptop, 'System'],
  ] as const;

  return <div className="theme-switcher" aria-label="Appearance">
    {items.map(([value, Icon, label]) => <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={preference === value} title={label}><Icon size={15}/><span>{label}</span></button>)}
  </div>;
}
