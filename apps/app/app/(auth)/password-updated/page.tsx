import { Button } from "@neptlium/ui";
import { AuthShell } from "../components/AuthShell";

export default function PasswordUpdatedPage() {
  return (
    <AuthShell>
      <div className="mb-6 h-7" />

      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Password updated
          </h1>
          <p className="text-[13px] text-text-muted">
            Your Neptlium account password has been changed successfully.
          </p>
          <p className="text-[13px] text-text-muted">
            For your security, review active sessions after signing in.
          </p>
        </div>
        <Button
          href="/auth/sign-in"
          variant="cta"
          className="h-11 w-full rounded-md text-[14px] font-semibold"
        >
          Sign In
        </Button>
      </div>
    </AuthShell>
  );
}
