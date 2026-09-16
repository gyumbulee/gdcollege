import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * Unlike every other /api/session/* and staff proxy route, this streams a
 * file rather than JSON — the browser needs a plain same-origin URL it can
 * navigate to (`<a href="...">`) for the download to trigger, and it never
 * has the bearer token itself (httpOnly cookie), so the token has to be
 * attached here rather than by the browser.
 */
export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/management/reports/students.csv${request.nextUrl.search}`, {
    headers: { Accept: "text/csv", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { success: false, message: "Could not generate the export." },
      { status: upstream.status || 502 }
    );
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/csv",
      "Content-Disposition": upstream.headers.get("Content-Disposition") ?? "attachment; filename=students.csv",
    },
  });
}
