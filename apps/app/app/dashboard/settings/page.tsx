import { Card, CardContent, CardHeader, CardTitle } from "@neptlium/ui";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireProvisionedUser } from "@/lib/auth";
import { MfaEnrollment } from "./MfaEnrollment";
import { RevokeSessionsButton } from "./RevokeSessionsButton";

const EVENT_LABELS: Record<string, string> = {
  login: "Signed in",
  logout: "Signed out",
  signup: "Account created",
  password_updated: "Password changed",
  mfa_enrolled: "Authenticator app enrolled",
  mfa_unenrolled: "Authenticator app removed",
  sessions_revoked: "Other sessions signed out"
};

export default async function SettingsPage() {
  const { user, profile } = await requireProvisionedUser();
  const supabase = await createSupabaseServerClient();

  const { data: loginHistory } = await supabase
    .from("login_history")
    .select("id, event_type, user_agent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: organization } = profile.organizationId
    ? await supabase
        .from("organizations")
        .select("name, role, website, industry, country, organization_size, aum_range")
        .eq("id", profile.organizationId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Settings</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Account, security, and preference management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-body-sm text-text-muted">Name</p>
            <p className="text-body text-text-primary">{profile.fullName ?? profile.displayName ?? "—"}</p>
          </div>
          <div>
            <p className="text-body-sm text-text-muted">Email</p>
            <p className="text-body text-text-primary">{profile.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-body-sm text-text-muted">Account purpose</p>
            <p className="text-body text-text-primary">{profile.investorType ?? "—"}</p>
          </div>
          <div>
            <p className="text-body-sm text-text-muted">Compliance status</p>
            <p className="text-body text-text-primary capitalize">{profile.complianceStatus ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-body-sm text-text-muted">Company name</p>
              <p className="text-body text-text-primary">{organization.name}</p>
            </div>
            <div>
              <p className="text-body-sm text-text-muted">Your role</p>
              <p className="text-body text-text-primary">{organization.role ?? "—"}</p>
            </div>
            <div>
              <p className="text-body-sm text-text-muted">Industry</p>
              <p className="text-body text-text-primary">{organization.industry ?? "—"}</p>
            </div>
            <div>
              <p className="text-body-sm text-text-muted">Country</p>
              <p className="text-body text-text-primary">{organization.country ?? "—"}</p>
            </div>
            <div>
              <p className="text-body-sm text-text-muted">Organization size</p>
              <p className="text-body text-text-primary">{organization.organization_size ?? "—"}</p>
            </div>
            {organization.aum_range && (
              <div>
                <p className="text-body-sm text-text-muted">Assets under management</p>
                <p className="text-body text-text-primary">{organization.aum_range}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Multi-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <MfaEnrollment />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RevokeSessionsButton />

          <div className="flex flex-col gap-2">
            <p className="text-body-sm font-medium text-text-secondary">Recent activity</p>
            {loginHistory && loginHistory.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {loginHistory.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between rounded-md border border-border-hairline px-3 py-2 text-body-sm"
                  >
                    <span className="text-text-primary">{EVENT_LABELS[event.event_type] ?? event.event_type}</span>
                    <span className="text-text-muted">{new Date(event.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-text-muted">No recorded activity yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
