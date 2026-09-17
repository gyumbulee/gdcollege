import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const payload = await request.json();
  const { status, body } = await apiFetch("/admin/users", { method: "POST", token, body: JSON.stringify(payload) });
  return NextResponse.json(body, { status });
}
