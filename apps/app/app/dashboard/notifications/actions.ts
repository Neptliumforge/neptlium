"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);

  revalidatePath("/dashboard/notifications");
}
