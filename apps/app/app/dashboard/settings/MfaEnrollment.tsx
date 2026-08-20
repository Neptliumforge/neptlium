"use client";

import { UserProfile } from '@clerk/nextjs';

export function MfaEnrollment() {
  return <UserProfile routing="hash" />;
}
