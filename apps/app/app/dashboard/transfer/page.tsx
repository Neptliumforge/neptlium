import { requireProvisionedUser } from "@/lib/auth";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@neptlium/ui";

export default async function TransferPage() {
  await requireProvisionedUser();

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
          Transfer
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Send funds to other Neptlium accounts by alias
        </p>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3">
              <Clock className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-text-primary">Transfers coming soon</p>
              <p className="mt-1.5 text-[13px] text-text-muted leading-relaxed">
                Internal alias-based transfers between Neptlium accounts are not yet available. This
                feature is being developed and will be available in a future release.
              </p>
            </div>
            <div className="rounded-md border border-border-default bg-surface-2 px-4 py-3 text-left w-full">
              <p className="text-[12px] font-semibold text-text-secondary mb-1.5">
                What will be supported:
              </p>
              <ul className="space-y-1 text-[12px] text-text-muted">
                <li>• Send USD to other Neptlium users by username or alias</li>
                <li>• Instant settlement between Neptlium accounts</li>
                <li>• Transfer history and status tracking</li>
                <li>• Recipient verification before sending</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
