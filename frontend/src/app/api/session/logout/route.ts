import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";
import { clearSessionCookies, getSessionToken } from "@/lib/auth/session";

export async function POST() {
  const token = await getSessionToken();

  if (token) {
    await apiFetch("/auth/logout", { method: "POST", token });
  }

  await clearSessionCookies();

  return NextResponse.json({ success: true, message: "Signed out." });
}
