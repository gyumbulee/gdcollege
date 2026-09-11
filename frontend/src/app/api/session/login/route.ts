import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { setSessionCookies } from "@/lib/auth/session";
import type { SessionUser } from "@/types/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { status, body } = await apiFetch<{ token: string; user: SessionUser }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (!body.success) {
    return NextResponse.json(
      { success: false, message: body.message },
      { status }
    );
  }

  await setSessionCookies(body.data.token, body.data.user);

  return NextResponse.json({ success: true, message: body.message });
}
