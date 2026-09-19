import "server-only";
import { apiFetch } from "./client";

export type UserNotification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function getNotifications(token: string, unreadOnly = false) {
  return apiFetch<{ items: UserNotification[]; unread_count: number }>(
    `/notifications${unreadOnly ? "?unread_only=1" : ""}`,
    { token }
  );
}
