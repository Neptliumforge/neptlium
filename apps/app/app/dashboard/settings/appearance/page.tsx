import { SettingsShell } from '@/components/settings/SettingsShell';
import { ThemeSwitcher } from '@/components/navigation/ThemeSwitcher';

export default function Page() {
  return <SettingsShell title="Appearance" description="Light, dark and system appearance follow the canonical Neptlium theme authority.">
    <section className="op-panel" aria-label="Appearance preferences">
      <h2>Choose your appearance</h2>
      <p>Select Light, Dark or System. Your preference is saved on this device.</p>
      <ThemeSwitcher />
    </section>
  </SettingsShell>;
}
