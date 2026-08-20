import { Button } from "@neptlium/ui";
import { SignOutButton } from "@clerk/nextjs";
import { AuthShell } from "../components/AuthShell";

export default function UnauthorizedPage() {
  return (
    <AuthShell>
      <div className="mb-6 h-7" />

      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Access restricted
          </h1>
          <p className="text-[13px] text-text-muted">
            Your account does not have permission to access this area.
          </p>
        </div>
        <Button
          href="/dashboard"
          variant="cta"
          className="h-11 w-full rounded-md text-[14px] font-semibold"
        >
          Return to Dashboard
        </Button>
        <SignOutButton redirectUrl="/auth/sign-in">
          <Button
            variant="outline"
            className="h-11 w-full rounded-md text-[14px]"
          >
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </AuthShell>
  );
}
