import { Section, Stack } from '@neptlium/ui';
import { requireUser } from '@/lib/auth';
import { getNotifications } from '@/lib/api/client';
import { ProductStateMessage } from '@/components/product/ProductState';
import { NotificationItem } from './NotificationItem';
import { MarkAllReadButton } from './MarkAllReadButton';

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
    <Stack>
      <header>
        <h1>Notifications</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-muted">Account, security, and operational notices.</p>
      </header>

      <Section title="Recent notifications" action={hasUnread ? <MarkAllReadButton /> : undefined}>
        <div className="border-y border-border-hairline">
          {loadError ? (
            <ProductStateMessage state="ERROR" title="Notifications unavailable">Notification state could not be loaded from the Neptlium API.</ProductStateMessage>
          ) : notifications.length === 0 ? (
            <ProductStateMessage state="NO_ACTIVITY" title="No notifications">You are up to date.</ProductStateMessage>
          ) : (
            <ul className="divide-y divide-border-hairline">
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
        </div>
      </Section>
    </Stack>
  );
}
