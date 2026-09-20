"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { UserNotification } from "@/lib/api/notifications";

export function NotificationList({ initial, unreadCount }: { initial: UserNotification[]; unreadCount: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    router.refresh();
  }

  async function markAllRead() {
    setPending(true);
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (initial.length === 0) {
    return <EmptyState title="No notifications yet" description="You'll see updates about your applications, results, payments, and announcements here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{unreadCount} unread</p>
          <Button type="button" variant="ghost" onClick={markAllRead} aria-disabled={pending}>
            Mark all as read
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {initial.map((n) => {
          const content = (
            <div className={`rounded-lg border p-4 ${n.read_at ? "border-border bg-white" : "border-sky-dark bg-sky-light"}`}>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
              <p className="mt-2 text-xs text-muted">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          );

          return (
            <div
              key={n.id}
              onClick={() => !n.read_at && markRead(n.id)}
              className={!n.link && !n.read_at ? "cursor-pointer-target" : undefined}
            >
              {n.link ? <Link href={n.link}>{content}</Link> : content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
