import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

/**
 * One generic proxy for all nine academic-structure entity types rather
 * than nine near-identical route files — they all follow the exact same
 * shape (JSON create/update/delete against Laravel's own apiResource
 * routes from Phase 2). Allowlisted against the resources Phase 2's
 * routes actually register, so `resource` can never become a path into
 * something this proxy wasn't meant to reach.
 */
const ALLOWED_RESOURCES = [
  "schools", "departments", "programmes", "academic-sessions", "semesters",
  "levels", "course-types", "courses", "course-offerings",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { resource } = await params;
  if (!ALLOWED_RESOURCES.includes(resource)) {
    return NextResponse.json({ success: false, message: "Unknown resource." }, { status: 404 });
  }

  const payload = await request.json();
  const { status, body } = await apiFetch(`/${resource}`, { method: "POST", token, body: JSON.stringify(payload) });
  return NextResponse.json(body, { status });
}
