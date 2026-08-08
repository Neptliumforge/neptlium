import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/auth/sign-in");
}
