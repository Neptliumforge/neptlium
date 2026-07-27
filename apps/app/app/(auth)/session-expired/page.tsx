import { Button } from "@neptlium/ui";
import { AuthShell } from "../components/AuthShell";
import { safeInternalPath } from "../auth-utils";

export default async function SessionExpiredPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeInternalPath(next, "/dashboard");

  return (
    <AuthShell>
      <div className="mb-6 h-7" />

      <div className="flex flex-col gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text-primary">
            Session expired
          </h1>
          <p className="text-[13px] text-text-muted">
            Sign in again to continue securely.
          </p>
        </div>
        <Button
          href={`/login?next=${encodeURIComponent(destination)}`}
          variant="cta"
          className="h-11 w-full rounded-md text-[14px] font-semibold"
        >
          Sign In
        </Button>
      </div>
    </AuthShell>
  );
}
