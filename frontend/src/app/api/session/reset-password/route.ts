import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  const { token, email, password, password_confirmation } = await request.json();

  const { status, body } = await apiFetch<Record<string, never>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, email, password, password_confirmation }),
  });

  if (!body.success) {
    return NextResponse.json(
      { success: false, message: body.message },
      { status }
    );
  }

  return NextResponse.json({ success: true, message: body.message });
}
