import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SettingsShell, TruthfulUnavailable } from '@/components/settings/SettingsShell';

export default function NotificationSettingsPage() {
  return (
    <SettingsShell title="Notifications" description="How Neptlium contacts you.">
      <TruthfulUnavailable
        title="Notification preferences aren’t configurable yet"
        detail="No preference is saved here. Emails you ask for, like password resets and email confirmations, are always sent."
      />
      <section className="op-panel">
        <Link className="op-inline-link" href="/dashboard/notifications">
          View your notifications <ArrowRight size={14} />
        </Link>
      </section>
    </SettingsShell>
  );
}
