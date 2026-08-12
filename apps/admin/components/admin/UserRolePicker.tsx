"use client";

import { useState, useTransition } from "react";
import { getRoleLabel, type Role } from "@neptlium/lib";
import { DELEGABLE_ROLES } from "@/lib/auth/authorization";

interface UserRolePickerProps {
  readonly userId: string;
  readonly currentRole: Role;
  readonly onUpdate: (userId: string, newRole: Role) => Promise<{ ok: boolean; error?: string }>;
  readonly isSuperAdmin?: boolean;
}

export function UserRolePicker({
  userId,
  currentRole,
  onUpdate
}: UserRolePickerProps) {
  const [selected, setSelected] = useState<Role>(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (currentRole === "super_admin") {
    return (
      <div className="space-y-1">
        <p className="text-[13px] font-medium text-text-primary">General Platform Administrator</p>
        <p className="text-[11px] leading-4 text-text-muted">
          This role is singular and cannot be delegated or changed from the admin console.
        </p>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    setSelected(newRole);
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await onUpdate(userId, newRole);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error ?? "Update failed.");
        setSelected(currentRole);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={selected}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-md border border-border-default bg-surface-1 px-3 py-1.5 text-[13px] text-text-primary focus:border-border-focus focus:outline-none disabled:opacity-60"
      >
        {currentRole === "admin" && (
          <option value="admin" disabled>
            {getRoleLabel("admin")} — legacy role
          </option>
        )}
        {DELEGABLE_ROLES.map((role) => (
          <option key={role} value={role}>
            {getRoleLabel(role)}
          </option>
        ))}
      </select>
      {currentRole === "admin" && (
        <p className="text-[11px] leading-4 text-text-muted">
          Legacy admin access is not delegable. Select a non-administrative role to revoke it.
        </p>
      )}
      {error && <p className="text-[11px] text-danger-text">{error}</p>}
      {success && <p className="text-[11px] text-success-text">Role updated.</p>}
    </div>
  );
}
