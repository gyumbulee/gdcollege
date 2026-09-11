import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/types/auth";

const TOKEN_COOKIE = "gdcw_token";
const USER_COOKIE = "gdcw_user";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookies(token: string, user: SessionUser) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOptions);
  store.set(USER_COOKIE, JSON.stringify(user), cookieOptions);
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

/** Returns the signed-in user for this request, or null if not signed in. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Use at the top of a protected Server Component. Redirects to the login
 * page (preserving the original destination) if there's no session.
 *
 * NOTE: this only gates what the UI *shows*. Every actual write/read of
 * sensitive data still goes through Laravel, which independently enforces
 * permissions via EnsurePermission — this is UX, not the security boundary.
 */
export async function requireSession(nextPath: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(`/student/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

/** UI-only permission check — see the note on requireSession above. */
export function can(session: SessionUser | null, permission: string): boolean {
  if (!session) return false;
  if (session.roles.includes("super_administrator")) return true;
  return session.permissions.includes(permission);
}
