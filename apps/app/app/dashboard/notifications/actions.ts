"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/client";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  await requireUser();
  await markNotificationRead(notificationId);
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await requireUser();
  await markAllNotificationsRead();
  revalidatePath("/dashboard/notifications");
}
