import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="w-full max-w-[400px] text-center flex flex-col items-center gap-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border-default bg-surface-1">
        <ShieldOff className="size-6 text-text-muted" />
      </div>

      <div>
        <h1 className="text-[20px] font-semibold text-text-primary">Access Denied</h1>
        <p className="mt-2 text-[13px] text-text-muted leading-relaxed">
          Your account does not have permission to access the admin console. Contact a super
          administrator if you believe this is an error.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-default bg-surface-1 px-4 text-[13px] font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
}
