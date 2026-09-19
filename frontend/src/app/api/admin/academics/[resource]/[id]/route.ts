import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

const ALLOWED_RESOURCES = [
  "schools", "departments", "programmes", "academic-sessions", "semesters",
  "levels", "course-types", "courses", "course-offerings",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { resource, id } = await params;
  if (!ALLOWED_RESOURCES.includes(resource)) {
    return NextResponse.json({ success: false, message: "Unknown resource." }, { status: 404 });
  }

  const payload = await request.json();
  const { status, body } = await apiFetch(`/${resource}/${id}`, { method: "PATCH", token, body: JSON.stringify(payload) });
  return NextResponse.json(body, { status });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { resource, id } = await params;
  if (!ALLOWED_RESOURCES.includes(resource)) {
    return NextResponse.json({ success: false, message: "Unknown resource." }, { status: 404 });
  }

  const { status, body } = await apiFetch(`/${resource}/${id}`, { method: "DELETE", token });
  return NextResponse.json(body, { status });
}
