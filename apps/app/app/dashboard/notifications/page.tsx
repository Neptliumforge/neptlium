import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@neptlium/ui";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/api/client";
import { NotificationItem } from "./NotificationItem";
import { MarkAllReadButton } from "./MarkAllReadButton";

export default async function NotificationsPage() {
  await requireUser();
  let notifications;
  let loadError = false;
  try {
    notifications = (await getNotifications()).data;
  } catch {
    notifications = [];
    loadError = true;
  }
  const hasUnread = notifications.some((notification) => !notification.readAt);

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
          {loadError ? (
            <p className="py-6 text-sm text-text-muted">Notifications are unavailable. Try again later.</p>
          ) : notifications.length === 0 ? (
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
                  createdAt={notification.createdAt}
                  readAt={notification.readAt}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
