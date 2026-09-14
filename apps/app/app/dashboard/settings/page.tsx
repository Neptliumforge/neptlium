import { SettingsExperience } from '@/components/product/RecordExperiences';
import { MfaEnrollment } from './MfaEnrollment';

export default function SettingsPage() {
  return (
    <div className="op-stack">
      <SettingsExperience />
      <section className="op-panel">
        <div className="op-section-heading"><div><span>Authentication</span><h2>Security controls</h2></div></div>
        <p className="op-settings-intro">Manage multi-factor authentication and active Supabase Auth sessions. Authentication controls remain separate from financial authority.</p>
        <div className="op-auth-settings"><MfaEnrollment /></div>
      </section>
    </div>
  );
}
