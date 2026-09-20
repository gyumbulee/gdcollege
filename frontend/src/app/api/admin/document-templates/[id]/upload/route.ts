import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * Same reasoning as /api/admin/institution: bypasses apiFetch() (which
 * hardcodes JSON headers) so the browser's multipart/form-data boundary
 * is forwarded untouched.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { id } = await params;
  const form = await request.formData();

  const response = await fetch(`${API_BASE_URL}/admin/document-templates/${id}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: form,
  });

  const body = await response.json();
  return NextResponse.json(body, { status: response.status });
}
