import "server-only";
import { apiFetch } from "./client";

export type AdminPage = { id: number; slug: string; title: string; content: string; status: string };
export type AdminPost = { id: number; slug: string; title: string; excerpt: string | null; content: string; status: string; published_at: string | null; cover_image_url: string | null };
export type AdminEvent = { id: number; slug: string; title: string; description: string | null; starts_at: string; ends_at: string | null; location: string | null; status: string; cover_image_url: string | null };
export type AdminFaq = { id: number; question: string; answer: string; category: string | null; sort_order: number };
export type AdminDownload = { id: number; title: string; category: string | null; original_filename: string; file_url: string | null };
export type AdminGallery = { id: number; slug: string; title: string; description: string | null; status: string; items_count?: number };
export type AdminAnnouncement = { id: number; title: string; content: string; audience_type: string; audience_id: number | null; status: string; publish_at: string | null };

export function getAdminPages(token: string) {
  return apiFetch<AdminPage[]>("/admin/cms/pages", { token });
}
export function getAdminPosts(token: string) {
  return apiFetch<{ items: AdminPost[]; pagination: unknown }>("/admin/cms/posts", { token });
}
export function getAdminEvents(token: string) {
  return apiFetch<{ items: AdminEvent[]; pagination: unknown }>("/admin/cms/events", { token });
}
export function getAdminFaqs(token: string) {
  return apiFetch<AdminFaq[]>("/admin/cms/faqs", { token });
}
export function getAdminDownloads(token: string) {
  return apiFetch<AdminDownload[]>("/admin/cms/downloads", { token });
}
export function getAdminGalleries(token: string) {
  return apiFetch<AdminGallery[]>("/admin/cms/galleries", { token });
}
export function getAdminGallery(token: string, id: string) {
  return apiFetch<AdminGallery & { items: { id: number; image_url: string; caption: string | null }[] }>(`/admin/cms/galleries/${id}`, { token });
}
export function getAdminAnnouncements(token: string) {
  return apiFetch<{ items: AdminAnnouncement[]; pagination: unknown }>("/admin/cms/announcements", { token });
}
