import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getNotifications } from "@/lib/api/notifications";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationList } from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  await requireSession("/notifications");
  const token = await getSessionToken();
  const { body } = await getNotifications(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Your account</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Notifications</h1>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load notifications" description={body.message} />
      ) : (
        <NotificationList initial={body.data.items} unreadCount={body.data.unread_count} />
      )}
    </Container>
  );
}
