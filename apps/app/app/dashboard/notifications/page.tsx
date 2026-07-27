import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@neptlium/ui";
import { createSupabaseServerClient } from "@neptlium/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { NotificationItem } from "./NotificationItem";
import { MarkAllReadButton } from "./MarkAllReadButton";

export default async function NotificationsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, category, title, body, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = data ?? [];
  const hasUnread = notifications.some((notification) => !notification.read_at);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">Notifications</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Account, security, and portfolio alerts</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent notifications</CardTitle>
          {hasUnread && <MarkAllReadButton />}
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell className="size-5" aria-hidden="true" />} title="No notifications" description="You're all caught up." />
          ) : (
            <ul className="flex flex-col gap-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  category={notification.category}
                  title={notification.title}
                  body={notification.body}
                  createdAt={notification.created_at}
                  readAt={notification.read_at}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
