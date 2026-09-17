import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ role: string; permission: string }> }
) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });

  const { role, permission } = await params;
  const { status, body } = await apiFetch(`/admin/roles/${role}/permissions/${permission}/toggle`, { method: "POST", token });
  return NextResponse.json(body, { status });
}
