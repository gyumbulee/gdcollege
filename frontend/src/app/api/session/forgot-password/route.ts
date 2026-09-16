import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const { body } = await apiFetch<Record<string, never>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  // Always success:true here too — the backend already returns the same
  // generic message whether or not the email exists, to avoid leaking
  // which addresses have accounts (see PasswordController::forgot).
  return NextResponse.json({ success: body.success, message: body.message });
}
