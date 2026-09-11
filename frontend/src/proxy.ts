import { NextRequest, NextResponse } from "next/server";

/**
 * Coarse-grained route protection: redirect to /student/login if there's
 * no session cookie at all. This is a fast, edge-level UX check only —
 * fine-grained, permission-level authorization always happens on the
 * Laravel API (see EnsurePermission), never here.
 *
 * Add new protected segments to `config.matcher` below as later phases
 * introduce role-specific dashboards (e.g. /student/dashboard, /lecturer,
 * /hod, /admin).
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("gdcw_user");

  if (!hasSession) {
    const loginUrl = new URL("/student/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
