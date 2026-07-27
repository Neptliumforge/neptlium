import type { User } from "@supabase/supabase-js";
import { getRoleLabel, type Role } from "@neptlium/lib";
import { Badge } from "@neptlium/ui";
import { AdminSignOutButton } from "./AdminSignOutButton";

interface AdminTopbarProps {
  readonly user: User;
  readonly role: Role;
  readonly displayName: string | null;
}

export function AdminTopbar({ user, role, displayName }: AdminTopbarProps) {
  const name = displayName ?? user.email ?? "Admin";

  return (
    <div className="flex w-full items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[12px] font-medium text-text-primary leading-none">{name}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{getRoleLabel(role)}</p>
        </div>
        <Badge tone="neutral" className="text-[10px] font-mono">
          {role}
        </Badge>
        <AdminSignOutButton />
      </div>
    </div>
  );
}
