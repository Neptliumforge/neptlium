import Link from "next/link";
import { Button } from "@neptlium/ui";
import { AuthShell } from "../components/AuthShell";

export default function AuthErrorPage() {
  return (
    <AuthShell>
      <div className="mb-6 h-7" />

      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Couldn&apos;t complete this request
          </h1>
          <p className="text-[13px] text-text-muted">
            The authentication link may be invalid or expired.
          </p>
        </div>
        <Button
          href="/auth/sign-in"
          variant="cta"
          className="h-11 w-full rounded-md text-[14px] font-semibold"
        >
          Return to Sign In
        </Button>
        <Link
          href="/reset-password"
          className="text-center text-[13px] font-medium text-accent-primary hover:brightness-110"
        >
          Request a new link
        </Link>
      </div>
    </AuthShell>
  );
}
