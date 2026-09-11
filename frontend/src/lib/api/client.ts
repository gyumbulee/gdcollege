/**
 * Server-side fetch wrapper for the Laravel API. This file is only ever
 * imported from Route Handlers / Server Components (never sent to the
 * browser) — the browser talks exclusively to this app's own
 * /api/session/* routes, which use this client to reach Laravel. Keeping
 * the Laravel URL and any bearer token server-side is what lets us store
 * the auth token in an httpOnly cookie instead of localStorage.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

type ApiEnvelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors: Record<string, string[]> };

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<{ status: number; body: ApiEnvelope<T> }> {
  const { token, headers, ...rest } = init;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const body = (await response.json()) as ApiEnvelope<T>;
  return { status: response.status, body };
}
