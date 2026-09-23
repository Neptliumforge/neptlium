import { SettingsShell } from '@/components/settings/SettingsShell';
import { MfaEnrollment } from '../MfaEnrollment';
export default function Page(){return <SettingsShell title="Security and access" description="Authentication and session controls supported by your current account."><section className="op-panel"><div className="op-section-heading"><div><span>Authentication</span><h2>Security controls</h2></div></div><div className="op-auth-settings"><MfaEnrollment /></div></section></SettingsShell>}
