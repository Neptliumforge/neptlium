"use client";

import { SignOutButton } from '@clerk/nextjs';
import { LogOut } from "lucide-react";

export function AdminSignOutButton() {
  return (
    <SignOutButton redirectUrl="/login">
      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-text-muted hover:text-text-secondary hover:bg-[color:var(--color-surface-1)] transition-colors">
        <LogOut className="size-3.5" />
        Sign out
      </button>
    </SignOutButton>
  );
}
