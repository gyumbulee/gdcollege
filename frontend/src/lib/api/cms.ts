import { apiFetch } from "./client";

export type PublicPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
};

export type PublicEvent = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  cover_image_url: string | null;
};

export type PublicGallery = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type?: string;
  items?: { id: number; image_url: string; caption: string | null }[];
};

export type PublicDownload = {
  id: number;
  title: string;
  category: string | null;
  file_url: string | null;
  original_filename: string;
};

export type PublicFaq = { id: number; question: string; answer: string; category: string | null };

export type PublicAnnouncement = { id: number; title: string; content: string; publish_at: string | null };

export type PublicPage = { id: number; slug: string; title: string; content: string };

/**
 * Same fail-soft convention as academics.ts's fetchList: an unreachable
 * or erroring API degrades the public site to an honest empty state
 * rather than a hard 500.
 */
async function fetchList<T>(path: string): Promise<{ ok: boolean; items: T[] }> {
  try {
    const { body } = await apiFetch<T[] | { items: T[] }>(path);
    if (!body.success) return { ok: false, items: [] };
    const data = body.data;
    return { ok: true, items: Array.isArray(data) ? data : data.items };
  } catch {
    return { ok: false, items: [] };
  }
}

async function fetchOne<T>(path: string): Promise<{ ok: boolean; item: T | null }> {
  try {
    const { body } = await apiFetch<T>(path);
    return body.success ? { ok: true, item: body.data } : { ok: false, item: null };
  } catch {
    return { ok: false, item: null };
  }
}

export function getPosts() {
  return fetchList<PublicPost>("/posts");
}

export function getPost(slug: string) {
  return fetchOne<PublicPost>(`/posts/${slug}`);
}

export function getEvents(includePast = false) {
  return fetchList<PublicEvent>(`/events${includePast ? "?include_past=1" : ""}`);
}

export function getEvent(slug: string) {
  return fetchOne<PublicEvent>(`/events/${slug}`);
}

export function getGalleries() {
  return fetchList<PublicGallery>("/galleries");
}

export function getGallery(slug: string) {
  return fetchOne<PublicGallery>(`/galleries/${slug}`);
}

/**
 * The single admin-curated "Homepage Carousel" gallery (Gallery::TYPE_FEATURED) —
 * deliberately not part of the public /gallery listing. A missing/unpublished
 * featured gallery is a normal state (fetchOne resolves it to item: null), not
 * an error — the homepage falls back to a placeholder carousel slide.
 */
export function getFeaturedGallery() {
  return fetchOne<PublicGallery>("/featured-gallery");
}

export function getDownloads() {
  return fetchList<PublicDownload>("/downloads");
}

export function getFaqs() {
  return fetchList<PublicFaq>("/faqs");
}

export function getPublicAnnouncements() {
  return fetchList<PublicAnnouncement>("/announcements");
}

export function getPage(slug: string) {
  return fetchOne<PublicPage>(`/pages/${slug}`);
}
