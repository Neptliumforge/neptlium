import { SettingsShell, TruthfulUnavailable } from '@/components/settings/SettingsShell';

export default function Page() {
  return (
    <SettingsShell
      title="Payment methods"
      description="Payment methods available for adding funds to your personal Capital account."
    >
      <TruthfulUnavailable
        title="Payment methods unavailable"
        detail="No payment method is currently available for this account. Available methods will appear here when supported."
      />
    </SettingsShell>
  );
}
