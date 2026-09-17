import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

/**
 * Deliberately bypasses the shared apiFetch() helper, same reasoning as
 * ApplicationDocumentController's frontend upload proxy: apiFetch hardcodes
 * `Content-Type: application/json`, which breaks multipart form data (the
 * browser/undici needs to set its own boundary). Forwarded as-is — the
 * incoming request is already multipart/form-data from the browser.
 */
export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const form = await request.formData();

  const response = await fetch(`${API_BASE_URL}/admin/institution`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: form,
  });

  const body = await response.json();
  return NextResponse.json(body, { status: response.status });
}
