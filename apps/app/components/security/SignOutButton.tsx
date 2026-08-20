"use client";

import { SignOutButton as ClerkSignOutButton } from '@clerk/nextjs';
import { Button } from "@neptlium/ui";

export function SignOutButton() {
  return (
    <ClerkSignOutButton redirectUrl="/auth/sign-in">
      <Button type="button" variant="outline" size="sm">Sign Out</Button>
    </ClerkSignOutButton>
  );
}
