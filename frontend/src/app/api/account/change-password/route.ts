import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { current_password, password, password_confirmation } = await request.json();

  const { status, body } = await apiFetch<Record<string, never>>("/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify({ current_password, password, password_confirmation }),
  });

  return NextResponse.json(body, { status });
}
