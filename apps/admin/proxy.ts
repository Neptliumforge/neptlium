import { updateSession } from "@neptlium/lib/supabase/middleware";
import type { NextRequest } from "next/server";

// Session refresh only — auth/role guards are enforced in (admin)/layout.tsx
// via requireAdminUser(), which calls redirect("/login") if unauthenticated.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
