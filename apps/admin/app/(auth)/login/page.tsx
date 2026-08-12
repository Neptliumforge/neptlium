import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { adminApiRequest } from "@/lib/api";
import { AdminLoginForm } from "./AdminLoginForm";

function safeInternalPath(value: string | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://neptlium.invalid");
    return url.origin === "https://neptlium.invalid"
      ? `${url.pathname}${url.search}`
      : fallback;
  } catch {
    return fallback;
  }
}

export default async function AdminLoginPage({
  searchParams
}: {
  readonly searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      await adminApiRequest<{ role: "super_admin" }>("/v1/admin/session");
      redirect("/dashboard");
    } catch {
      redirect("/unauthorized");
    }
  }

  const params = await searchParams;
  return <AdminLoginForm next={safeInternalPath(params.next)} />;
}
