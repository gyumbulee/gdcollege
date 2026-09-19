import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

/** Bypasses apiFetch same as InstitutionSettingsController's proxy — multipart needs its own Content-Type boundary. */
export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const form = await request.formData();
  const response = await fetch(`${API_BASE_URL}/admin/cms/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: form,
  });

  const body = await response.json();
  return NextResponse.json(body, { status: response.status });
}
