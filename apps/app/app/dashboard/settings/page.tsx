import Link from 'next/link';
import { AccountSignOut } from '@/components/settings/AccountSignOut';
import { ArrowRight } from 'lucide-react';
import { SettingsExperience } from '@/components/product/RecordExperiences';
import { settingsDestinations } from '@/components/settings/SettingsShell';

export default function SettingsPage() {
  return (
    <div className="op-stack">
      <SettingsExperience />
      <section className="op-panel" aria-labelledby="settings-sections-heading">
        <div className="op-section-heading">
          <div>
            <span>Manage</span>
            <h2 id="settings-sections-heading">Settings</h2>
          </div>
        </div>
        <nav aria-label="Settings sections" className="grid gap-2 sm:grid-cols-2">
          {settingsDestinations.map(([label, href]) => (
            <Link key={href} className="op-inline-link" href={href}>
              {label} <ArrowRight size={14} />
            </Link>
          ))}
        </nav>
      </section>
      <section className="op-panel" aria-label="Account session">
        <div className="op-section-heading"><div><span>Account</span><h2>Session</h2></div></div>
        <AccountSignOut />
      </section>
    </div>
  );
}
